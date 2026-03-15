import { MapPin } from 'lucide-react'
import { Input } from '@/components/ui/Input'

export interface LocationPickerProps {
  value?: string
  onChange: (value: string) => void
  placeholder?: string
}

export function LocationPicker({ value, onChange, placeholder = 'City or area' }: LocationPickerProps) {
  return (
    <Input
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      leftIcon={<MapPin className="size-4" />}
    />
  )
}
