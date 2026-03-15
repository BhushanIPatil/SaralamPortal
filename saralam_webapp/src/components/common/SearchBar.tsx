import { useState, useEffect } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { useDebounce } from '@/hooks/useDebounce'

export interface SearchBarProps {
  onSearch: (q: string) => void
  placeholder?: string
}

export function SearchBar({ onSearch, placeholder = 'Search services or jobs...' }: SearchBarProps) {
  const [value, setValue] = useState('')
  const debounced = useDebounce(value, 300)

  useEffect(() => {
    onSearch(debounced)
  }, [debounced, onSearch])

  return (
    <Input
      type="search"
      placeholder={placeholder}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      leftIcon={<Search className="size-4" />}
    />
  )
}
