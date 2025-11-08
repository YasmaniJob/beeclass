
'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Filter } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';

export interface FilterOption {
    id: string;
    label: string;
    options: string[];
}

interface FiltrosSheetProps {
    options: FilterOption[];
    activeFilters: { [key: string]: string[] };
    onCheckboxChange: (filterId: string, value: string, checked: boolean) => void;
    onClearFilters: () => void;
    activeFilterCount: number;
}

export function FiltrosSheet({
    options,
    activeFilters,
    onCheckboxChange,
    onClearFilters,
    activeFilterCount
}: FiltrosSheetProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [stagedFilters, setStagedFilters] = useState(activeFilters);

    const handleOpenChange = (open: boolean) => {
        if (open) {
            setStagedFilters(activeFilters);
        }
        setIsOpen(open);
    }
    
    const handleCheckboxStagedChange = (filterId: string, value: string, checked: boolean) => {
        setStagedFilters(prev => ({
            ...prev,
            [filterId]: checked
                ? [...(prev[filterId] || []), value]
                : (prev[filterId] || []).filter(item => item !== value),
        }));
    };
    
    const handleApplyFilters = () => {
        Object.keys(stagedFilters).forEach(key => {
            const filterId = key;
            const allOptions = options.find(opt => opt.id === filterId)?.options || [];
            
            allOptions.forEach(optionValue => {
                const isCurrentlyActive = activeFilters[filterId]?.includes(optionValue);
                const isStaged = stagedFilters[filterId]?.includes(optionValue);

                if (isCurrentlyActive !== isStaged) {
                     onCheckboxChange(filterId, optionValue, !!isStaged);
                }
            });
        });
        setIsOpen(false);
    };

    const handleClearAndApply = () => {
        onClearFilters();
        setStagedFilters({});
        setIsOpen(false);
    }

    return (
        <Sheet open={isOpen} onOpenChange={handleOpenChange}>
            <SheetTrigger asChild>
                 <Button variant="outline" className="relative">
                    <Filter className="mr-2 h-4 w-4" />
                    Filtros
                    {activeFilterCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">
                           {activeFilterCount}
                        </span>
                    )}
                </Button>
            </SheetTrigger>
            <SheetContent className="flex flex-col">
                <SheetHeader>
                    <SheetTitle>Filtros</SheetTitle>
                    <SheetDescription>
                        Aplica filtros para refinar los resultados de la tabla.
                    </SheetDescription>
                </SheetHeader>
                <ScrollArea className="flex-1 -mx-6">
                    <div className="space-y-6 px-6 py-4">
                        {options.map(filterGroup => (
                            <div key={filterGroup.id} className="space-y-3">
                                <h4 className="font-medium text-sm">{filterGroup.label}</h4>
                                <div className="space-y-2">
                                    {filterGroup.options.map(option => (
                                        <div key={option} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`${filterGroup.id}-${option}`}
                                                checked={stagedFilters[filterGroup.id]?.includes(option)}
                                                onCheckedChange={(checked) => handleCheckboxStagedChange(filterGroup.id, option, !!checked)}
                                            />
                                            <Label
                                                htmlFor={`${filterGroup.id}-${option}`}
                                                className="text-sm font-normal cursor-pointer"
                                            >
                                                {option}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
                <SheetFooter className="flex-row sm:justify-between">
                     <Button variant="ghost" onClick={handleClearAndApply}>Limpiar filtros</Button>
                     <div className="flex gap-2">
                        <SheetClose asChild>
                            <Button variant="secondary">Cancelar</Button>
                        </SheetClose>
                        <Button onClick={handleApplyFilters}>Aplicar</Button>
                    </div>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
