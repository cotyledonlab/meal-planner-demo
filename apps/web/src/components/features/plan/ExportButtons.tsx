'use client';

import { useMemo, useState } from 'react';
import { FileText, Download, Printer } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { cn } from '~/lib/utils';

interface ExportButtonsProps {
  planId: string;
  planStartDateIso: string;
  planDays: number;
}

type ExportMode = 'pdf' | 'csv';

const BASE_PATH =
  typeof process !== 'undefined'
    ? (process.env.NEXT_PUBLIC_BASE_PATH?.replace(/\/$/, '') ?? '')
    : '';

function resolveExportUrl(planId: string, mode: ExportMode): string {
  const endpoint =
    mode === 'pdf' ? `/api/plan/${planId}/export/pdf` : `/api/plan/${planId}/export/shopping-list`;
  return `${BASE_PATH}${endpoint}`;
}

function formatDateRange(startDate: Date, days: number): string {
  const endDate = new Date(startDate.getTime());
  endDate.setDate(endDate.getDate() + Math.max(days - 1, 0));
  const formatter = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  });

  if (days <= 1) {
    return formatter.format(startDate);
  }

  return `${formatter.format(startDate)}-${formatter.format(endDate)}`;
}

async function downloadBlob(url: string, filename: string) {
  const response = await fetch(url, { method: 'GET' });
  if (!response.ok) {
    throw new Error(await response.text());
  }

  const blob = await response.blob();
  const objectUrl = window.URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = filename;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  window.URL.revokeObjectURL(objectUrl);
}

export function ExportButtons({ planId, planStartDateIso, planDays }: ExportButtonsProps) {
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [isCsvLoading, setIsCsvLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const startDate = useMemo(() => new Date(planStartDateIso), [planStartDateIso]);
  const dateSegment = useMemo(
    () => formatDateRange(startDate, planDays).replace(/\s+/g, '').toLowerCase(),
    [startDate, planDays]
  );

  const handleExport = async (mode: ExportMode) => {
    try {
      setErrorMessage(null);
      if (mode === 'pdf') {
        setIsPdfLoading(true);
      } else {
        setIsCsvLoading(true);
      }

      const filename =
        mode === 'pdf' ? `meal-plan-${dateSegment}.pdf` : `shopping-list-${dateSegment}.csv`;
      await downloadBlob(resolveExportUrl(planId, mode), filename);
    } catch (error) {
      console.error(`Failed to export ${mode}`, error);
      setErrorMessage(
        mode === 'pdf'
          ? 'Unable to generate PDF right now. Please try again.'
          : 'Unable to export CSV right now. Please try again.'
      );
    } finally {
      if (mode === 'pdf') {
        setIsPdfLoading(false);
      } else {
        setIsCsvLoading(false);
      }
    }
  };

  const handlePrint = () => {
    const printUrl = `${BASE_PATH}/plan/${planId}/print`;
    const newWindow = window.open(printUrl, '_blank', 'noopener,noreferrer');
    if (!newWindow) {
      setErrorMessage('Please allow pop-ups to open the print view.');
    }
  };

  return (
    <div className="no-print flex flex-wrap items-center gap-3 rounded-2xl bg-white/80 p-4 shadow-sm ring-1 ring-gray-200 backdrop-blur-sm sm:flex-nowrap sm:p-5">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-gray-900">Export your plan</p>
        <p className="text-xs text-gray-600">
          Download a PDF (recipes included), export the shopping list, or open a print-friendly
          view.
        </p>
      </div>
      <div className="flex flex-wrap gap-2 sm:flex-nowrap">
        <Button
          type="button"
          onClick={() => handleExport('pdf')}
          disabled={isPdfLoading}
          size="sm"
          className="min-w-[140px]"
        >
          <FileText className="h-4 w-4" />
          {isPdfLoading ? 'Generating…' : 'Export PDF'}
        </Button>
        <Button
          type="button"
          onClick={() => handleExport('csv')}
          disabled={isCsvLoading}
          variant="secondary"
          size="sm"
          className="min-w-[150px]"
        >
          <Download className="h-4 w-4" />
          {isCsvLoading ? 'Preparing…' : 'Export CSV'}
        </Button>
        <Button
          type="button"
          onClick={handlePrint}
          variant="outline"
          size="sm"
          className="min-w-[120px]"
        >
          <Printer className="h-4 w-4" />
          Print
        </Button>
      </div>
      {errorMessage && (
        <p className="mt-2 w-full text-sm text-red-600 sm:mt-0 sm:text-right">{errorMessage}</p>
      )}
    </div>
  );
}

export default ExportButtons;
