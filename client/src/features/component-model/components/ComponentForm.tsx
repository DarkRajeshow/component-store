import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Combobox } from '@/components/ui/combobox';
import { createComponent } from '../services/api';
import { User } from '../types';
import { toast } from 'sonner';

const schema = z.object({
  name: z.string().min(2),
  description: z.string().min(5),
  issueNumber: z.string().min(1),
  latestRevisionNumber: z.string().min(1),
  componentCode: z.string().min(1),
  notifyTo: z.array(z.string()).min(1, 'Select at least one user'),
});

type FormValues = z.infer<typeof schema>;

interface ComponentFormProps {
  users: User[];
  onSuccess?: () => void;
}

export function ComponentForm({ users, onSuccess }: ComponentFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const notifyTo = watch('notifyTo') || [];

  const onSubmit = async (data: FormValues) => {
    try {
      await createComponent(data);
      toast.success('Component created!');
      onSuccess?.();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to create component');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-6 p-4">
      <div className="flex flex-col gap-4">
        <Input label="Name" {...register('name')} error={errors.name?.message} />
        <Textarea label="Description" {...register('description')} error={errors.description?.message} />
        <Input label="Issue Number" {...register('issueNumber')} error={errors.issueNumber?.message} />
      </div>
      <div className="flex flex-col gap-4">
        <Input label="Latest Revision Number" {...register('latestRevisionNumber')} error={errors.latestRevisionNumber?.message} />
        <Input label="Component Code" {...register('componentCode')} error={errors.componentCode?.message} />
        <Combobox
          label="Notify To"
          options={users.map(u => ({ value: u._id, label: u.name }))}
          value={notifyTo}
          onChange={vals => setValue('notifyTo', vals)}
          multiple
          error={errors.notifyTo?.message}
        />
      </div>
      <div className="col-span-2 flex justify-end">
        <Button type="submit" disabled={isSubmitting}>Create Component</Button>
      </div>
    </form>
  );
} 