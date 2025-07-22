'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { Check, ChevronsUpDown, Phone, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useDebounce } from '@/hooks/useDebounce'
import { useSearchCache } from '@/hooks/useSearchCache'

interface Contact {
  id: number
  firstName: string
  lastName: string
  fatherName?: string
  phone: string
  address?: string
  type: 'OWNER' | 'BUYER' | 'TENANT'
  displayName: string
  propertyCount: number
}

interface ContactSearchProps {
  onContactSelect: (contact: Contact | null) => void
  selectedContact: Contact | null
  placeholder?: string
  disabled?: boolean
  filterType?: 'OWNER' | 'BUYER' | 'TENANT'
}

export function ContactSearch({ 
  onContactSelect, 
  selectedContact, 
  placeholder = "Kontakt axtarın...",
  disabled = false,
  filterType
}: ContactSearchProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [contacts, setContacts] = useState<Contact[]>([])
  const [recentContacts, setRecentContacts] = useState<Contact[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingRecent, setIsLoadingRecent] = useState(false)
  
  const debouncedSearchQuery = useDebounce(searchQuery, 300)
  const searchCache = useSearchCache<Contact[]>({ maxAge: 3 * 60 * 1000, maxSize: 100 }) // 3 minutes cache
  const recentCache = useSearchCache<Contact[]>({ maxAge: 10 * 60 * 1000, maxSize: 10 }) // 10 minutes for recent

  // Load recent contacts when component mounts or popover opens
  useEffect(() => {
    const loadRecentContacts = async () => {
      if (!open) return
      
      const contactType = filterType || 'OWNER'
      const cacheKey = `recent-${contactType.toLowerCase()}`
      const cachedResults = recentCache.get(cacheKey)
      
      if (cachedResults) {
        setRecentContacts(cachedResults)
        return
      }
      
      if (isLoadingRecent) return
      
      setIsLoadingRecent(true)
      try {
        const response = await fetch(`/api/contacts/recent?limit=10&type=${contactType}`)
        if (response.ok) {
          const results = await response.json()
          setRecentContacts(results)
          recentCache.set(cacheKey, results)
        }
      } catch (error) {
        console.error('Failed to load recent contacts:', error)
      } finally {
        setIsLoadingRecent(false)
      }
    }

    loadRecentContacts()
  }, [open, filterType])

  // Search contacts when query changes
  useEffect(() => {
    const searchContacts = async () => {
      if (!debouncedSearchQuery.trim()) {
        setContacts([])
        return
      }

      const cacheKey = `search-${debouncedSearchQuery.toLowerCase()}`
      const cachedResults = searchCache.get(cacheKey)
      
      if (cachedResults) {
        setContacts(cachedResults)
        return
      }

      setIsLoading(true)
      try {
        const typeParam = filterType ? `&type=${filterType}` : ''
        const response = await fetch(`/api/contacts/search?q=${encodeURIComponent(debouncedSearchQuery)}&limit=20${typeParam}`)
        if (response.ok) {
          const results = await response.json()
          setContacts(results)
          searchCache.set(cacheKey, results)
        } else {
          setContacts([])
        }
      } catch (error) {
        console.error('Contact search failed:', error)
        setContacts([])
      } finally {
        setIsLoading(false)
      }
    }

    searchContacts()
  }, [debouncedSearchQuery, filterType])

  const handleSelect = (contact: Contact) => {
    onContactSelect(contact)
    setOpen(false)
    setSearchQuery("")
  }

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (open) {
      // Escape to close
      if (e.key === 'Escape') {
        setOpen(false)
        setSearchQuery("")
        e.preventDefault()
      }
      // Ctrl/Cmd + K to focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        // Focus will be handled by Command component
      }
    }
  }, [open])

  const handleClear = () => {
    onContactSelect(null)
    setSearchQuery("")
  }

  // Add keyboard event listener
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className={cn(
              "w-full justify-between",
              !selectedContact && "text-muted-foreground"
            )}
          >
            {selectedContact ? (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>{selectedContact.displayName}</span>
                <Badge variant="secondary" className="ml-auto">
                  {selectedContact.propertyCount} əmlak
                </Badge>
              </div>
            ) : (
              placeholder
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput 
              placeholder="Ad, soyad və ya telefon nömrəsi ilə axtarın... (Esc - bağla)"
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            {process.env.NODE_ENV === 'development' && (
              <div className="px-3 py-1 text-xs text-gray-500 border-b bg-gray-50">
                Cache: {searchCache.stats.hitRate} hit rate | Search: {searchCache.size} | Recent: {recentCache.size}
              </div>
            )}
            <CommandList>
              {isLoading && (
                <CommandEmpty>Axtarılır...</CommandEmpty>
              )}
              {!isLoading && searchQuery && contacts.length === 0 && (
                <CommandEmpty>Heç bir kontakt tapılmadı</CommandEmpty>
              )}
              {!searchQuery && recentContacts.length === 0 && !isLoadingRecent && (
                <CommandEmpty>Axtarmaq üçün ad, soyad və ya telefon daxil edin</CommandEmpty>
              )}
              {!searchQuery && isLoadingRecent && (
                <CommandEmpty>Son müştərilər yüklənir...</CommandEmpty>
              )}
              {!searchQuery && recentContacts.length > 0 && (
                <CommandGroup heading="Son Müştərilər">
                  {recentContacts.map((contact) => (
                    <CommandItem
                      key={contact.id}
                      value={contact.displayName}
                      onSelect={() => handleSelect(contact)}
                      className="flex items-center gap-3 p-3"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedContact?.id === contact.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <User className="h-4 w-4 text-green-500" />
                      <div className="flex-1">
                        <div className="font-medium">{contact.displayName}</div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Phone className="h-3 w-3" />
                          <span>{contact.phone}</span>
                          {contact.propertyCount > 0 && (
                            <Badge variant="outline" className="ml-auto">
                              {contact.propertyCount} əmlak
                            </Badge>
                          )}
                        </div>
                        {contact.address && (
                          <div className="text-xs text-gray-400 mt-1">
                            {contact.address}
                          </div>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
              {contacts.length > 0 && (
                <CommandGroup heading={searchQuery ? "Axtarış Nəticələri" : undefined}>
                  {contacts.map((contact) => (
                    <CommandItem
                      key={contact.id}
                      value={contact.displayName}
                      onSelect={() => handleSelect(contact)}
                      className="flex items-center gap-3 p-3"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedContact?.id === contact.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <User className="h-4 w-4 text-blue-500" />
                      <div className="flex-1">
                        <div className="font-medium">{contact.displayName}</div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Phone className="h-3 w-3" />
                          <span>{contact.phone}</span>
                          {contact.propertyCount > 0 && (
                            <Badge variant="outline" className="ml-auto">
                              {contact.propertyCount} əmlak
                            </Badge>
                          )}
                        </div>
                        {contact.address && (
                          <div className="text-xs text-gray-400 mt-1">
                            {contact.address}
                          </div>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      
      {selectedContact && (
        <div className="flex items-center justify-between p-2 bg-blue-50 rounded-md">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium">{selectedContact.displayName}</span>
            <Badge variant="secondary">{selectedContact.phone}</Badge>
          </div>
          <Button size="sm" variant="ghost" onClick={handleClear}>
            Ləğv et
          </Button>
        </div>
      )}
    </div>
  )
}