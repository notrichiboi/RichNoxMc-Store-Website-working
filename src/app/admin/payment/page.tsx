'use client';

import React, { useState, useEffect } from 'react';
import { getPaymentInfo, updatePaymentInfo } from '@/lib/firestore/settings';
import { AdminFormField } from '@/components/admin/AdminFormField';
import { AdminToggle } from '@/components/admin/AdminToggle';
import { AdminImageField } from '@/components/admin/AdminImageField';
import { AdminSaveBar } from '@/components/admin/AdminSaveBar';
import { AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function AdminPaymentPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const info = await getPaymentInfo();
      setData(info || {
        enabled: true,
        upiId: '',
        upiName: '',
        qrCodeUrl: '',
        instructions: 'Please follow the payment instructions and open a ticket on Discord.',
        methods: { upi: true, phonepe: true, gpay: true, paytm: true, bank: false }
      });
    } catch (error) {
      toast.error('Failed to load payment info');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setData((prev: any) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleMethodToggle = (method: string, value: boolean) => {
    setData((prev: any) => ({
      ...prev,
      methods: {
        ...(prev.methods || {}),
        [method]: value
      }
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updatePaymentInfo(data);
      toast.success('Payment information saved');
      setHasChanges(false);
    } catch (error) {
      toast.error('Failed to save payment info');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return null;

  return (
    <div className="p-6 max-w-4xl mx-auto pb-24">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Payment Information</h1>
        <p className="text-zinc-400">Configure the payment details shown to customers</p>
      </div>

      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 mb-8 flex items-start space-x-3 text-yellow-500">
        <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
        <div className="text-sm">
          <strong className="block font-semibold mb-1">Display Only Configuration</strong>
          This section configures DISPLAY-ONLY payment information. Payments are NOT processed automatically on the website. All purchases must be completed through manual transfers and verified on Discord.
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-[#111118] border border-zinc-800 rounded-xl p-6">
          <AdminToggle
            label="Enable Payment Info Display"
            description="Show the payment instructions modal when users click checkout"
            checked={!!data.enabled}
            onChange={(c) => handleChange('enabled', c)}
          />
        </div>

        {data.enabled && (
          <>
            <div className="bg-[#111118] border border-zinc-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">UPI Details</h2>
              <div className="space-y-4">
                <AdminFormField label="UPI ID">
                  <input
                    type="text"
                    value={data.upiId || ''}
                    onChange={(e) => handleChange('upiId', e.target.value)}
                    placeholder="example@upi"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-white"
                  />
                </AdminFormField>
                <AdminFormField label="Receiver Name">
                  <input
                    type="text"
                    value={data.upiName || ''}
                    onChange={(e) => handleChange('upiName', e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-white"
                  />
                </AdminFormField>
                <AdminImageField
                  label="QR Code URL"
                  value={data.qrCodeUrl || ''}
                  onChange={(v) => handleChange('qrCodeUrl', v)}
                />
              </div>
            </div>

            <div className="bg-[#111118] border border-zinc-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Accepted Methods</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <AdminToggle label="UPI" checked={!!data.methods?.upi} onChange={(c) => handleMethodToggle('upi', c)} />
                <AdminToggle label="PhonePe" checked={!!data.methods?.phonepe} onChange={(c) => handleMethodToggle('phonepe', c)} />
                <AdminToggle label="Google Pay" checked={!!data.methods?.gpay} onChange={(c) => handleMethodToggle('gpay', c)} />
                <AdminToggle label="Paytm" checked={!!data.methods?.paytm} onChange={(c) => handleMethodToggle('paytm', c)} />
                <AdminToggle label="Bank Transfer" checked={!!data.methods?.bank} onChange={(c) => handleMethodToggle('bank', c)} />
              </div>
            </div>

            <div className="bg-[#111118] border border-zinc-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Instructions</h2>
              <AdminFormField label="Payment Instructions (Markdown supported)">
                <textarea
                  value={data.instructions || ''}
                  onChange={(e) => handleChange('instructions', e.target.value)}
                  rows={6}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-white font-mono text-sm"
                />
              </AdminFormField>
            </div>
          </>
        )}
      </div>

      <AdminSaveBar
        isVisible={hasChanges}
        onSave={handleSave}
        onDiscard={() => {
          loadData();
          setHasChanges(false);
        }}
        isSaving={saving}
      />
    </div>
  );
}
