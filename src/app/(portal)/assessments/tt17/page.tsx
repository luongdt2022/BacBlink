"use client";

import React, { useState } from 'react';

export default function Tt17WizardPage() {
  const [data, setData] = useState({ equipment_name: '', year: 2026 });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Saving draft payload: " + JSON.stringify(data));
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Đánh giá trình độ công nghệ TT17</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="bg-white p-4 shadow rounded text-black">
          <h2 className="font-semibold mb-2">Nhóm T: Thiết bị</h2>
          <input 
            value={data.equipment_name} 
            onChange={(e) => setData({...data, equipment_name: e.target.value})} 
            placeholder="Tên thiết bị..." 
            className="border p-2 mr-2 text-black" 
          />
          <input 
            value={data.year} 
            onChange={(e) => setData({...data, year: parseInt(e.target.value) || 0})} 
            placeholder="Năm..." 
            className="border p-2 text-black" 
            type="number" 
          />
        </div>
        <button type="submit" className="bg-brand-700 text-white px-4 py-2 rounded">
          Lưu Nháp (Auto-Save)
        </button>
      </form>
    </div>
  );
}
