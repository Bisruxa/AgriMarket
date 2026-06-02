"use client";
import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { CheckCircle, AlertCircle, X } from "lucide-react";
interface MessageType {
  status: "success" | "error";
  message: string;
}

interface FieldType {
  id: string;
  name: string;
  label: string;
  type: string;
}

interface EditFormProps {
  Fields: FieldType[];
  endpoint?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSuccess?: (data: any) => void;
}

const EditForm = ({ Fields, endpoint = "/user/profile", onSuccess }: EditFormProps) => {
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<MessageType | null>(null);
  const [errors, setErrors] = useState<{ field: string; message: string }[]>([]);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    if (message) {
      setShowPopup(true);
      const timer = setTimeout(() => {
        setShowPopup(false);
        setTimeout(() => setMessage(null), 300);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const SubmitHandle = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    setErrors([]);

    const body: Record<string, string> = {};
    Fields.forEach(field => {
      const value = inputRefs.current[field.id]?.value || "";
      if (value.trim()) {
        body[field.name] = value;
      }
    });

    try {
      const response = await api.put(endpoint, body);
      
      if (response.success) {
        setMessage({
          status: "success",
          message: response.message || "Profile updated successfully!"
        });
        
        if (onSuccess && response.data) {
          onSuccess(response.data);
        }
      } else {
        setMessage({
          status: "error",
          message: response.message || "Something went wrong"
        });
        
        if (response.errors) {
          setErrors(response.errors);
        }
      }
    } catch (error) {
      setMessage({
        status: "error",
        message: "Network error. Please check your connection."
      });
    } finally {
      setLoading(false);
    }
  };

  const closePopup = () => {
    setShowPopup(false);
    setTimeout(() => setMessage(null), 300);
  };

  const getFieldError = (fieldId: string) => {
    const fieldError = errors.find(e => e.field === fieldId);
    return fieldError?.message;
  };

  return (
    <>
      {message && showPopup && (
        <div 
          className={`fixed top-5 right-5 z-50 flex items-center gap-3 p-4 rounded-lg shadow-lg border-l-4 transition-all duration-300 transform ${
            message.status === "success" 
              ? "bg-green-50 border-green-500 text-green-700" 
              : "bg-red-50 border-red-500 text-red-700"
          } ${showPopup ? "translate-x-0 opacity-100" : "translate-x-5 opacity-0"}`}
        >
          <div className="shrink-0">
            {message.status === "success" ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-500" />
            )}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">{message.message}</p>
          </div>
          <button
            onClick={closePopup}
            className="shrink-0 ml-4 hover:opacity-70 transition-opacity"
          >
            <X className={`h-4 w-4 ${message.status === "success" ? "text-green-500" : "text-red-500"}`} />
          </button>
        </div>
      )}

      <form onSubmit={SubmitHandle} className="pt-6 px-7">
        <div className="grid grid-cols-2 gap-4">
          {Fields.map((field) => {
            const fieldError = getFieldError(field.id);
            
            return (
              <div className="space-y-2" key={field.id}>
                <Label 
                  htmlFor={field.id}
                  className={fieldError ? "text-red-500" : ""}
                >
                  {field.label}
                </Label>
                <Input
                  ref={(el) => { inputRefs.current[field.id] = el; }}
                  className={`shadow-none focus-visible:ring-0 bg-black/5 focus-visible:ring-offset-0 focus:outline-none transition-colors ${
                    fieldError
                      ? "border-2 border-red-500 focus-visible:border-red-500 bg-red-50"
                      : "border border-gray-300 focus-visible:border-gray-400"
                  }`}
                  id={field.id}
                  name={field.name}
                  type={field.type}
                  disabled={loading}
                  aria-invalid={!!fieldError}
                />
                {fieldError && (
                  <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {fieldError}
                  </p>
                )}
              </div>
            );
          })}

          <div className="col-span-2 flex justify-end mt-5">
            <Button
              type="submit"
              disabled={loading}
              className="bg-[rgb(172,197,167)] text-lg rounded-4xl w-40 py-7 transition duration-300 ease-in-out hover:bg-[#2A5A2A] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </div>
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </div>
      </form>

      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes slideOut {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(100%);
            opacity: 0;
          }
        }
      `}</style>
    </>
  );
};

export default EditForm;