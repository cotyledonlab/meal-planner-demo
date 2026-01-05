'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { isPremiumUser } from '~/lib/auth';
import { ShoppingList } from './ShoppingList';
import { PriceComparisonModal } from './PriceComparisonModal';

interface ShoppingListWithPriceComparisonProps {
  planId: string;
}

export function ShoppingListWithPriceComparison({ planId }: ShoppingListWithPriceComparisonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: session } = useSession();
  const isPremium = isPremiumUser(session?.user);

  const handleComparePrices = () => {
    setIsModalOpen(true);
  };

  return (
    <>
      <ShoppingList planId={planId} onComparePrices={handleComparePrices} />
      <PriceComparisonModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        planId={planId}
        isPremium={isPremium}
      />
    </>
  );
}

export default ShoppingListWithPriceComparison;
