'use client';

import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminDragListProps<T> {
  items: T[];
  keyExtractor: (item: T) => string;
  onReorder: (items: T[]) => void;
  renderItem: (item: T, dragHandleProps: any) => React.ReactNode;
  className?: string;
}

export function AdminDragList<T>({
  items,
  keyExtractor,
  onReorder,
  renderItem,
  className
}: AdminDragListProps<T>) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((i) => keyExtractor(i) === active.id);
      const newIndex = items.findIndex((i) => keyExtractor(i) === over.id);
      
      onReorder(arrayMove(items, oldIndex, newIndex));
    }
  };

  const itemIds = items.map(keyExtractor);

  return (
    <DndContext 
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
        <div className={cn("space-y-2", className)}>
          {items.map((item) => (
            <SortableItem 
              key={keyExtractor(item)} 
              id={keyExtractor(item)}
            >
              {(dragHandleProps) => renderItem(item, dragHandleProps)}
            </SortableItem>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

interface SortableItemProps {
  id: string;
  children: (dragHandleProps: any) => React.ReactNode;
}

function SortableItem({ id, children }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  const dragHandleProps = {
    ...attributes,
    ...listeners,
    className: "cursor-grab active:cursor-grabbing p-2 text-zinc-500 hover:text-zinc-300"
  };

  return (
    <div ref={setNodeRef} style={style} className="relative">
      {children(dragHandleProps)}
    </div>
  );
}

export function DragHandle(props: any) {
  return (
    <div {...props}>
      <GripVertical className="h-5 w-5" />
    </div>
  );
}
