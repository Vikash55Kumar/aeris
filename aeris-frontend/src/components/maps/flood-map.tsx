'use client';

import React from 'react';
import Image from 'next/image';
import { Waves } from 'lucide-react';

export const FloodMap: React.FC = () => {
  return (
    <div className="relative aspect-video rounded-xl overflow-hidden border border-[#203047] bg-black">
      <Image src="/images/flood-map.jpg" alt="Flood Inundation Map" fill className="object-cover" />
    </div>
  );
};
