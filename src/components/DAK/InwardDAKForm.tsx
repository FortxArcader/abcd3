import React, { useState } from "react";
import { X, Save, Upload } from "lucide-react";
import { useDAKData } from "../../hooks/useDAKData";
import { useDepartments } from "../../hooks/useDepartments";

interface InwardDAKFormProps {
    onClose: () => void;
    onSuccess: () => void;
}

const InwardDAKForm: React.FC<InwardDAKFormProps> = ({
    onClose,
    onSuccess,
}) => {
    const { createDocument } = useDAKData();
    const { departments } = useDepartments();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        reference_number: "",
        subject: "",
        sender: "",
        sender_address: "",
        department_id: "",
        priority: "medium" as const,
        due_date: "",
        remarks: "",
        content: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Validate required fields
        if (!formData.department_id || !formData.subject || !formData.sender) {
            alert("Please fill all required fields.");
            setLoading(false);
            return;
        }

        const { error, data } = await createDocument({
            ...formData,
            due_date: formData.due_date ? formData.due_date : undefined,
            sender_address: formData.sender_address
                ? formData.sender_address
                : undefined,
            remarks: formData.remarks ? formData.remarks : undefined,
            content: formData.content ? formData.content : undefined,
            reference_number: formData.reference_number
                ? formData.reference_number
                : undefined,
            type: "inward",
            status: "received",
            date_received: new Date().toISOString(),
        });

        if (error) {
            console.error("Supabase error:", error);
            alert("Error creating document: " + error);
        } else {
            onSuccess();
            onClose();
        }
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h4 className="text-lg font-semibold text-gray-900">
                            Register Inward DAK
                        </h4>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Reference Number
                            </label>
                            <input
                                type="text"
                                value={formData.reference_number}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        reference_number: e.target.value,
                                    })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Enter reference number"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Department{" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={formData.department_id}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        department_id: e.target.value,
                                    })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            >
                                <option value="">Select Department</option>
                                {departments.map((dept) => (
                                    <option key={dept.id} value={dept.id}>
                                        {dept.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Subject <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.subject}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    subject: e.target.value,
                                })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter subject"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Sender <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.sender}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        sender: e.target.value,
                                    })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Enter sender name"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Priority
                            </label>
                            <select
                                value={formData.priority}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        priority: e.target.value as any,
                                    })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="urgent">Urgent</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Sender Address
                        </label>
                        <textarea
                            value={formData.sender_address}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    sender_address: e.target.value,
                                })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            rows={2}
                            placeholder="Enter sender address"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Due Date
                        </label>
                        <input
                            type="date"
                            value={formData.due_date}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    due_date: e.target.value,
                                })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Content
                        </label>
                        <textarea
                            value={formData.content}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    content: e.target.value,
                                })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            rows={4}
                            placeholder="Enter document content"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Remarks
                        </label>
                        <textarea
                            value={formData.remarks}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    remarks: e.target.value,
                                })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            rows={3}
                            placeholder="Enter any remarks"
                        />
                    </div>

                    <div className="flex items-center justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" />
                            <span>
                                {loading ? "Saving..." : "Register DAK"}
                            </span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default InwardDAKForm;
