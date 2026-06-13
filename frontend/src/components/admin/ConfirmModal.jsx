import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden transform transition-all scale-100">
                <div className="flex justify-between items-center p-5 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-500">
                            <AlertTriangle size={20} />
                        </div>
                        <h2 className="text-lg font-black text-gray-800 tracking-tight">{title || 'Xác nhận xóa'}</h2>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-red-600 bg-gray-50 hover:bg-red-50 p-2 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>
                <div className="p-6">
                    <p className="text-gray-600 text-sm leading-relaxed">{message}</p>
                </div>
                <div className="p-5 bg-gray-50/50 border-t border-gray-100 flex justify-end gap-3">
                    <button onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 hover:text-gray-800 rounded-xl transition shadow-sm">
                        Hủy bỏ
                    </button>
                    <button onClick={() => { onConfirm(); onClose(); }} className="px-5 py-2.5 text-sm font-bold text-white bg-red-500 hover:bg-red-600 rounded-xl transition shadow-lg shadow-red-200">
                        Đồng ý
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
