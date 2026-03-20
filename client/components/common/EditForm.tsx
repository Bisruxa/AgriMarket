import React from 'react'
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Define the field type
interface Field {
  id: string;
  label: string;
  type: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

interface EditFormProps {
  Fields: Field[];
  onSubmit?: (e: React.FormEvent) => void;
  onSave?: () => void;
}

const EditForm = ({ Fields, onSubmit, onSave }: EditFormProps) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(e);
    } else if (onSave) {
      onSave();
    }
  };

  return (
    <form className="pt-6 px-7" onSubmit={handleSubmit}>
      <div className="grid grid-cols-2 gap-4">
        {Fields.map((field) => (
          <div className="space-y-2" key={field.id}>
            <Label htmlFor={field.id}>{field.label}</Label>
            <Input
              className="shadow-none focus-visible:ring-0 bg-black/5 focus-visible:ring-offset-0 focus:outline-none"
              id={field.id}
              type={field.type}
              placeholder={field.placeholder}
              value={field.value}
              onChange={field.onChange}
            />
          </div>
        ))}
        <Button 
          type="submit"
          className="bg-[rgb(172,197,167)] text-lg rounded-4xl mt-5 w-40 py-7 ml-65 transition duration-300 ease-in-out hover:bg-[#2A5A2A]"
        >
          Save
        </Button>
      </div>
    </form>
  )
}

export default EditForm