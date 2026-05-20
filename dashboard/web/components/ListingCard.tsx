'use client';
import { motion } from 'framer-motion';
import { ListingCard as RawListingCard, type ListingCardProps } from './raw/ListingCard';
import { layoutSpring } from '@/lib/motion-presets';

export function ListingCard(props: ListingCardProps) {
  return (
    <motion.div
      data-testid="motion-listing-card"
      layout
      transition={layoutSpring}
      whileHover={{ x: -3, y: -3 }}
    >
      <RawListingCard {...props} />
    </motion.div>
  );
}
