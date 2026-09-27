"""
Spatiotemporal ConvLSTM-UNet Neural Architecture for 0-6h Radar Nowcasting.
"""
import torch
import torch.nn as nn
from typing import Tuple, List, Optional


class ConvLSTMCell(nn.Module):
    """
    2D Convolutional LSTM Cell for Spatio-Temporal feature propagation.
    Computes input, forget, cell, and output gates with 2D spatial convolutions.
    """

    def __init__(self, in_channels: int, hidden_dim: int, kernel_size: int = 3, bias: bool = True):
        super().__init__()
        self.in_channels = in_channels
        self.hidden_dim = hidden_dim
        self.kernel_size = kernel_size
        self.padding = kernel_size // 2
        self.bias = bias

        self.conv = nn.Conv2d(
            in_channels=self.in_channels + self.hidden_dim,
            out_channels=4 * self.hidden_dim,
            kernel_size=self.kernel_size,
            padding=self.padding,
            bias=self.bias,
        )

    def forward(self, x: torch.Tensor, h_prev: torch.Tensor, c_prev: torch.Tensor) -> Tuple[torch.Tensor, torch.Tensor]:
        combined = torch.cat([x, h_prev], dim=1)
        gates = self.conv(combined)
        
        i_gate, f_gate, o_gate, g_gate = torch.chunk(gates, 4, dim=1)
        i = torch.sigmoid(i_gate)
        f = torch.sigmoid(f_gate)
        o = torch.sigmoid(o_gate)
        g = torch.tanh(g_gate)

        c_next = f * c_prev + i * g
        h_next = o * torch.tanh(c_next)
        return h_next, c_next

    def init_hidden(self, batch_size: int, height: int, width: int, device: torch.device) -> Tuple[torch.Tensor, torch.Tensor]:
        h = torch.zeros(batch_size, self.hidden_dim, height, width, device=device)
        c = torch.zeros(batch_size, self.hidden_dim, height, width, device=device)
        return h, c


class DoubleConv(nn.Module):
    """(Convolution => BatchNorm => LeakyReLU) * 2"""

    def __init__(self, in_channels: int, out_channels: int):
        super().__init__()
        self.net = nn.Sequential(
            nn.Conv2d(in_channels, out_channels, kernel_size=3, padding=1, bias=False),
            nn.BatchNorm2d(out_channels),
            nn.LeakyReLU(0.2, inplace=True),
            nn.Conv2d(out_channels, out_channels, kernel_size=3, padding=1, bias=False),
            nn.BatchNorm2d(out_channels),
            nn.LeakyReLU(0.2, inplace=True),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.net(x)


class ConvLSTMUNetNowcaster(nn.Module):
    """
    Multi-Scale ConvLSTM-UNet for 0-6 Hour Atmospheric Precipitation Nowcasting.
    
    Architecture:
    1. Spatial UNet Encoder extracts multi-scale atmospheric features.
    2. Recurrent ConvLSTM Bottleneck models storm advection, convection, and decay dynamics.
    3. Spatial UNet Decoder with skip-connections reconstructs future radar echo fields.
    """

    def __init__(
        self,
        in_channels: int = 3,
        out_channels: int = 1,
        base_features: int = 32,
        future_steps: int = 24, # 24 steps * 15 min = 6 hours
    ):
        super().__init__()
        self.future_steps = future_steps
        
        # Spatial Encoder
        self.inc = DoubleConv(in_channels, base_features)
        self.down1 = nn.Sequential(
            nn.MaxPool2d(2),
            DoubleConv(base_features, base_features * 2)
        )
        self.down2 = nn.Sequential(
            nn.MaxPool2d(2),
            DoubleConv(base_features * 2, base_features * 4)
        )

        # ConvLSTM Bottleneck
        self.convlstm = ConvLSTMCell(
            in_channels=base_features * 4,
            hidden_dim=base_features * 4,
            kernel_size=3
        )

        # Spatial Decoder with Skip Connections
        self.up1 = nn.ConvTranspose2d(base_features * 4, base_features * 2, kernel_size=2, stride=2)
        self.dec_conv1 = DoubleConv(base_features * 4, base_features * 2)

        self.up2 = nn.ConvTranspose2d(base_features * 2, base_features, kernel_size=2, stride=2)
        self.dec_conv2 = DoubleConv(base_features * 2, base_features)

        # Output Prediction Head
        self.out_conv = nn.Sequential(
            nn.Conv2d(base_features, out_channels, kernel_size=1),
            nn.Sigmoid() # Normalizes radar output to [0, 1]
        )

    def encode(self, x: torch.Tensor) -> Tuple[torch.Tensor, torch.Tensor, torch.Tensor]:
        x1 = self.inc(x)
        x2 = self.down1(x1)
        x3 = self.down2(x2)
        return x1, x2, x3

    def decode(self, bottleneck: torch.Tensor, x1: torch.Tensor, x2: torch.Tensor) -> torch.Tensor:
        u1 = self.up1(bottleneck)
        # Handle shape mismatch if non-divisible
        if u1.shape[2:] != x2.shape[2:]:
            u1 = nn.functional.interpolate(u1, size=x2.shape[2:], mode="bilinear", align_corners=False)
        d1 = self.dec_conv1(torch.cat([u1, x2], dim=1))

        u2 = self.up2(d1)
        if u2.shape[2:] != x1.shape[2:]:
            u2 = nn.functional.interpolate(u2, size=x1.shape[2:], mode="bilinear", align_corners=False)
        d2 = self.dec_conv2(torch.cat([u2, x1], dim=1))

        out = self.out_conv(d2)
        return out

    def forward(self, x: torch.Tensor, forecast_steps: Optional[int] = None) -> torch.Tensor:
        """
        Forward Pass.
        Args:
            x: Input tensor of shape (B, C, H, W) representing current atmospheric state.
            forecast_steps: Number of forward 15-minute time steps to predict (default: self.future_steps).
        Returns:
            predictions: Tensor of shape (B, T_future, 1, H, W) containing forecasted radar fields.
        """
        b, c, h, w = x.shape
        steps = forecast_steps or self.future_steps
        device = x.device

        x1, x2, x3 = self.encode(x)
        _, _, b_h, b_w = x3.shape
        
        h_state, c_state = self.convlstm.init_hidden(b, b_h, b_w, device)
        predictions: List[torch.Tensor] = []

        cur_input = x3
        for _ in range(steps):
            h_state, c_state = self.convlstm(cur_input, h_state, c_state)
            pred_step = self.decode(h_state, x1, x2)
            predictions.append(pred_step)
            # Re-encode prediction into latent space for next autoregressive step
            _, _, cur_input = self.encode(torch.cat([pred_step, pred_step, pred_step], dim=1))

        return torch.stack(predictions, dim=1) # (B, T_future, 1, H, W)
