'use client';

import { useState } from 'react';
import MealPlanWizard, { type MealPreferences } from '~/app/_components/MealPlanWizard';
import MealPlanView from '~/app/_components/MealPlanView';
import ShoppingList from '~/app/_components/ShoppingList';
import PremiumPreviewModal from '~/app/_components/PremiumPreviewModal';

type Step = 'wizard' | 'plan' | 'shopping' | 'premium';

export default function PlannerPage() {
  const [step, setStep] = useState<Step>('wizard');
  const [preferences, setPreferences] = useState<MealPreferences | null>(null);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  const handleWizardComplete = (prefs: MealPreferences) => {
    setPreferences(prefs);
    setStep('plan');
  };

  const handleViewShoppingList = () => {
    setStep('shopping');
  };

  const handleComparePrices = () => {
    setShowPremiumModal(true);
  };

  const handleClosePremiumModal = () => {
    setShowPremiumModal(false);
  };

  return (
    <main className="min-h-screen">
      {/* Wizard Step */}
      {step === 'wizard' && <MealPlanWizard onComplete={handleWizardComplete} />}

      {/* Meal Plan View */}
      {step === 'plan' && preferences && (
        <MealPlanView preferences={preferences} onViewShoppingList={handleViewShoppingList} />
      )}

      {/* Shopping List */}
      {step === 'shopping' && <ShoppingList onComparePrices={handleComparePrices} />}

      {/* Premium Preview Modal */}
      {showPremiumModal && <PremiumPreviewModal onClose={handleClosePremiumModal} />}
    </main>
  );
}
