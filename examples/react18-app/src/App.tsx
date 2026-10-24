import { useRef, useState } from 'react'

import { Button } from '@/components/nxds/components/button/button'
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
} from '@/components/nxds/components/combobox/combobox'
import { DatePicker } from '@/components/nxds/components/date-picker/date-picker'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/nxds/components/dialog/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/nxds/components/dropdown-menu/dropdown-menu'
import {
  MultiSelect,
  MultiSelectContent,
  MultiSelectItem,
  MultiSelectTrigger,
  MultiSelectValue,
} from '@/components/nxds/components/multi-select/multi-select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/nxds/components/popover/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/nxds/components/select/select'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/nxds/components/sheet/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/nxds/components/tabs/tabs'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/nxds/components/tooltip/tooltip'

const REGIONS = [
  { value: 'eu-west', label: 'EU West' },
  { value: 'us-east', label: 'US East' },
  { value: 'ap-south', label: 'Asia Pacific South' },
]

const TEAMS = [
  { value: 'design', label: 'Design' },
  { value: 'platform', label: 'Platform' },
  { value: 'growth', label: 'Growth' },
  { value: 'support', label: 'Support' },
]

function RegionCombobox() {
  const [open, setOpen] = useState(false)
  const [region, setRegion] = useState('eu-west')
  const label = REGIONS.find((option) => option.value === region)?.label

  const choose = (next: string) => {
    setRegion(next)
    setOpen(false)
  }

  return (
    <Combobox open={open} onOpenChange={setOpen}>
      <ComboboxTrigger className="nx:w-64">
        <span className="nx:min-w-0 nx:flex-1 nx:truncate nx:text-left">{label ?? 'Choose a region'}</span>
      </ComboboxTrigger>
      <ComboboxContent label="Region">
        <ComboboxInput placeholder="Search regions…" />
        <ComboboxList>
          <ComboboxEmpty>No region found.</ComboboxEmpty>
          <ComboboxGroup>
            {REGIONS.map((option) => (
              <ComboboxItem
                key={option.value}
                value={option.value}
                keywords={[option.label]}
                selected={region === option.value}
                onSelect={choose}
              >
                {option.label}
              </ComboboxItem>
            ))}
          </ComboboxGroup>
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

export default function App() {
  const inviteRef = useRef<HTMLButtonElement>(null)

  return (
    <main className="nx:mx-auto nx:flex nx:max-w-3xl nx:flex-col nx:gap-8 nx:p-8">
      <header className="nx:flex nx:items-center nx:justify-between">
        <h1 className="nx:m-0 nx:typography-heading-small">Workspace settings</h1>
        <div className="nx:flex nx:gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" ref={inviteRef}>
                Invite
              </Button>
            </TooltipTrigger>
            <TooltipContent>Invite people to this workspace</TooltipContent>
          </Tooltip>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost">More</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Export members</DropdownMenuItem>
              <DropdownMenuItem>Leave workspace</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
        </TabsList>
        <TabsContent value="general" className="nx:flex nx:flex-col nx:gap-4 nx:pt-4">
          <Select defaultValue="weekly">
            <SelectTrigger className="nx:w-64" aria-label="Digest">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily digest</SelectItem>
              <SelectItem value="weekly">Weekly digest</SelectItem>
            </SelectContent>
          </Select>
          <RegionCombobox />
          <MultiSelect defaultValues={['design', 'platform']}>
            <MultiSelectTrigger aria-label="Teams" className="nx:w-64">
              <MultiSelectValue placeholder="Choose teams" />
            </MultiSelectTrigger>
            <MultiSelectContent searchPlaceholder="Search teams…" emptyMessage="No teams found.">
              {TEAMS.map((team) => (
                <MultiSelectItem key={team.value} value={team.value}>
                  {team.label}
                </MultiSelectItem>
              ))}
            </MultiSelectContent>
          </MultiSelect>
        </TabsContent>
        <TabsContent value="schedule" className="nx:pt-4">
          <DatePicker mode="single" />
        </TabsContent>
      </Tabs>

      <footer className="nx:flex nx:gap-2">
        <Button variant="ghost" onClick={() => inviteRef.current?.focus()}>
          Invite someone
        </Button>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">Workspace ID</Button>
          </PopoverTrigger>
          <PopoverContent>ws_4f8a21</PopoverContent>
        </Popover>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline">Activity</Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Activity</SheetTitle>
              <SheetDescription>Changes to this workspace in the last 30 days.</SheetDescription>
            </SheetHeader>
          </SheetContent>
        </Sheet>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="destructive">Delete workspace</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete workspace?</DialogTitle>
              <DialogDescription>Members lose access, and the data can't be restored.</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="destructive">Delete</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </footer>
    </main>
  )
}
