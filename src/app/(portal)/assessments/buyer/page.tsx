"use client";
import React, { useState } from 'react';

export default function BuyerWizardPage() {
  const [data, setData] = useState({ nhu_cau: '', nganh_nghe: '' });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Lưu Nhu Cầu Tìm Mua: " + JSON.stringify(data));
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Hồ sơ Nhu cầu Tìm mua (Buyer)</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="bg-white p-4 shadow rounded text-black">
          <input 
            value={data.nhu_cau} 
            onChange={(e) => setData({...data, nhu_cau: e.target.value})} 
            placeholder="Nhu cầu công nghệ..." 
            className="border p-2 mr-2 w-full mb-2 text-black" 
          />
          <input 
            value={data.nganh_nghe} 
            onChange={(e) => setData({...data, nganh_nghe: e.target.value})} 
            placeholder="Ngành nghề..." 
            className="border p-2 w-full text-black" 
          />
        </div>
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
          Lưu Hồ Sơ
        </button>
      </form>
    </div>
  );
}
