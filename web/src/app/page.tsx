import AdvisoryForm from '@/components/AdvisoryForm';

export default function Home() {
  return (
    <div className="space-y-4">
      <div className="pt-2 pb-1">
        <h2 className="text-2xl font-bold text-gray-800">Crop Advisory</h2>
        <p className="text-gray-500 text-sm mt-1">
          Upload a photo of your crop to receive instant AI-powered guidance.
        </p>
      </div>
      <AdvisoryForm />
    </div>
  );
}
