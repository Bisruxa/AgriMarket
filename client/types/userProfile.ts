export interface InputFieldProps {
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  showPassword?: boolean;
  onTogglePassword?: () => void;
}
export interface SidebarButtonProps {
  icon: React.ElementType;
  label: string;
  active: boolean;
  onClick: () => void;
}
export interface PasswordForm {
  current: string;
  new: string;
  confirm: string;
}

export interface ShowPasswordState {
  current: boolean;
  new: boolean;
  confirm: boolean;
}

export interface ErrorsState {
  submit?: string;
  current?: string;
  new?: string;
  confirm?: string;
}

export interface MessageState {
  text: string;
  type: 'success' | 'error' | '';
}

export interface UserProfilePopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface User {
  name?: string;
  email?: string;
  role?: string;
}
