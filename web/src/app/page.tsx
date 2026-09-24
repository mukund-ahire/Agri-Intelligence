export default function Home() {
  return (
    <div className="space-y-6">
      <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center space-y-4">
        <div className="w-16 h-16 bg-green-100 text-green-700 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Crop Advisory</h2>
        <p className="text-gray-500">Upload a photo of your crop to receive instant, localized AI guidance.</p>
        
        <div className="pt-4">
          <button className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center space-x-2">
            <span>Upload Crop Image</span>
          </button>
        </div>
      </section>

      <section className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-start space-x-3">
        <div className="text-blue-500 mt-1">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-blue-800">Location & Weather</h3>
          <p className="text-sm text-blue-600 mt-1">We use your location to provide accurate weather and agronomy context for the AI analysis.</p>
        </div>
      </section>
    </div>
  );
}
