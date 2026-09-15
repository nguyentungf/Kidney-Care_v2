import { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Activity, ArrowDownRight, ArrowUpRight, Eye, Plus, Trash2 } from 'lucide-react';
import { Link } from 'wouter';
import { getListPatientsQueryKey, useCreatePatient, useDeletePatient, useListPatients } from '@workspace/api-client-react';
import { FormField, Modal, PageIntro, SearchField, StateBlock, StatusBadge, ToastMessage, dateLabel } from '@/components/ui-kit';

const emptyForm = { fullName: '', dateOfBirth: '', gender: 'Female', phone: '', stage: 'CKD Stage 3', status: 'stable' as 'stable' | 'watch' | 'critical', egfr: '45', doctor: 'Dr. Mira Sen', address: '', diagnosis: '', allergies: '', medications: '' };

export default function Patients() {
  const client = useQueryClient();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | 'stable' | 'watch' | 'critical'>('all');
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [toast, setToast] = useState('');
  const params = useMemo(() => ({ search: search || undefined, status: status === 'all' ? undefined : status }), [search, status]);
  const query = useListPatients(params);
  const create = useCreatePatient();
  const remove = useDeletePatient();

  const updateField = (field: keyof typeof emptyForm, value: string) => setForm((current) => ({ ...current, [field]: value }));
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    create.mutate({ data: { ...form, egfr: Number(form.egfr) } }, {
      onSuccess: () => { client.invalidateQueries({ queryKey: getListPatientsQueryKey() }); setCreateOpen(false); setForm(emptyForm); setToast('Patient added to the registry'); setTimeout(() => setToast(''), 3000); },
    });
  };
  const deletePatient = (id: number, name: string) => {
    if (!window.confirm(`Remove ${name} from the active registry?`)) return;
    remove.mutate({ id }, { onSuccess: () => { client.invalidateQueries({ queryKey: getListPatientsQueryKey() }); setToast('Patient removed'); setTimeout(() => setToast(''), 3000); } });
  };
  const patients = query.data ?? [];
  return (
    <div className="page-enter">
      <PageIntro eyebrow="Care team directory" title="Patient registry" description="Search the active census, review risk signals, and open a patient's care context." action={<button onClick={() => setCreateOpen(true)} data-testid="button-create-patient" className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-bold text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-primary/90"><Plus className="h-4 w-4" /> Add patient</button>} />
      <div className="clinical-card rounded-xl p-4 sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row"><div className="flex-1"><SearchField value={search} onChange={setSearch} placeholder="Search by name or patient code" testId="input-patient-search" /></div><div className="flex gap-1 overflow-x-auto rounded-lg bg-muted p-1">{(['all', 'stable', 'watch', 'critical'] as const).map((item) => <button key={item} onClick={() => setStatus(item)} data-testid={`button-filter-${item}`} className={`whitespace-nowrap rounded-md px-3 py-2 text-xs font-bold capitalize transition ${status === item ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>{item === 'all' ? 'All patients' : item}</button>)}</div></div>
      </div>
      <div className="mt-5">
        {query.isLoading ? <StateBlock kind="loading" title="Loading patient registry" detail="Gathering current patient records." /> : query.isError ? <StateBlock kind="error" title="Registry unavailable" detail="We couldn't retrieve patient records." action={<button onClick={() => query.refetch()} data-testid="button-retry-patients" className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">Retry</button>} /> : patients.length === 0 ? <StateBlock kind="empty" title="No patients match this view" detail={search ? 'Try a different name, code, or remove the search filter.' : 'Add your first patient to begin building the care census.'} action={<button onClick={() => setCreateOpen(true)} data-testid="button-empty-create-patient" className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground"><Plus className="mr-1.5 inline h-4 w-4" /> Add patient</button>} /> : <PatientTable patients={patients} onDelete={deletePatient} deleting={remove.isPending} />}
      </div>
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Add a patient" description="Create a record for the active renal care census.">
        <form onSubmit={submit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2"><FormField label="Full name"><input required minLength={2} data-testid="input-patient-name" value={form.fullName} onChange={(e) => updateField('fullName', e.target.value)} className="form-input" placeholder="e.g. Elena Marquez" /></FormField><FormField label="Date of birth"><input required type="date" data-testid="input-patient-dob" value={form.dateOfBirth} onChange={(e) => updateField('dateOfBirth', e.target.value)} className="form-input" /></FormField></div>
          <div className="grid gap-4 sm:grid-cols-2"><FormField label="Gender"><select data-testid="select-patient-gender" value={form.gender} onChange={(e) => updateField('gender', e.target.value)} className="form-input"><option>Female</option><option>Male</option><option>Non-binary</option><option>Not recorded</option></select></FormField><FormField label="Phone"><input required data-testid="input-patient-phone" value={form.phone} onChange={(e) => updateField('phone', e.target.value)} className="form-input" placeholder="(555) 010-2040" /></FormField></div>
          <div className="grid gap-4 sm:grid-cols-3"><FormField label="CKD stage"><select data-testid="select-patient-stage" value={form.stage} onChange={(e) => updateField('stage', e.target.value)} className="form-input"><option>CKD Stage 1</option><option>CKD Stage 2</option><option>CKD Stage 3</option><option>CKD Stage 4</option><option>CKD Stage 5</option></select></FormField><FormField label="eGFR"><input required type="number" min="0" max="150" data-testid="input-patient-egfr" value={form.egfr} onChange={(e) => updateField('egfr', e.target.value)} className="form-input" /></FormField><FormField label="Status"><select data-testid="select-patient-status" value={form.status} onChange={(e) => updateField('status', e.target.value)} className="form-input"><option value="stable">Stable</option><option value="watch">Watch</option><option value="critical">Critical</option></select></FormField></div>
          <div className="grid gap-4 sm:grid-cols-2"><FormField label="Primary nephrologist"><input required data-testid="input-patient-doctor" value={form.doctor} onChange={(e) => updateField('doctor', e.target.value)} className="form-input" /></FormField><FormField label="Address"><input data-testid="input-patient-address" value={form.address} onChange={(e) => updateField('address', e.target.value)} className="form-input" placeholder="Street, city, state" /></FormField></div>
          <div className="grid gap-4 sm:grid-cols-2"><FormField label="Diagnosis"><input data-testid="input-patient-diagnosis" value={form.diagnosis} onChange={(e) => updateField('diagnosis', e.target.value)} className="form-input" /></FormField><FormField label="Allergies"><input data-testid="input-patient-allergies" value={form.allergies} onChange={(e) => updateField('allergies', e.target.value)} className="form-input" placeholder="None known" /></FormField></div>
          <div className="flex justify-end gap-2 border-t border-border pt-5"><button type="button" onClick={() => setCreateOpen(false)} data-testid="button-cancel-patient" className="rounded-lg px-4 py-2.5 text-sm font-bold text-muted-foreground hover:bg-muted">Cancel</button><button disabled={create.isPending} data-testid="button-submit-patient" className="rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-50">{create.isPending ? 'Saving…' : 'Save patient'}</button></div>
        </form>
      </Modal>
      {toast && <ToastMessage message={toast} />}
    </div>
  );
}

function PatientTable({ patients, onDelete, deleting }: { patients: Array<{ id: number; code: string; fullName: string; dateOfBirth: string; gender: string; stage: string; status: 'stable' | 'watch' | 'critical'; egfr: number; egfrTrend: 'up' | 'down' | 'stable'; doctor: string; updatedAt: string }>; onDelete: (id: number, name: string) => void; deleting: boolean }) {
  return <div className="clinical-card overflow-hidden rounded-xl"><div className="hidden grid-cols-[1.45fr_.75fr_.6fr_.7fr_1fr_32px] gap-4 border-b border-border bg-muted/35 px-5 py-3 text-[10px] font-bold uppercase tracking-[.12em] text-muted-foreground md:grid"><span>Patient</span><span>Stage</span><span>eGFR</span><span>Status</span><span>Care lead</span><span /></div><div className="divide-y divide-border">{patients.map((patient) => <div key={patient.id} data-testid={`row-patient-${patient.id}`} className="grid gap-3 px-4 py-4 transition hover:bg-muted/30 md:grid-cols-[1.45fr_.75fr_.6fr_.7fr_1fr_32px] md:items-center md:gap-4 md:px-5"><div className="flex min-w-0 items-center gap-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-xs font-extrabold text-primary">{patient.fullName.split(' ').map((part) => part[0]).slice(0, 2).join('')}</div><div className="min-w-0"><Link href={`/patients/${patient.id}`} data-testid={`link-patient-${patient.id}`} className="block truncate text-sm font-extrabold hover:text-primary">{patient.fullName}</Link><div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground"><span className="mono">{patient.code}</span><span>·</span><span>{patient.gender}</span><span className="hidden sm:inline">· {dateLabel(patient.dateOfBirth)}</span></div></div></div><div className="flex items-center gap-2 text-xs md:block"><span className="text-muted-foreground md:hidden">Stage</span><span className="font-semibold">{patient.stage}</span></div><div className="flex items-center gap-2 text-xs md:block"><span className="text-muted-foreground md:hidden">eGFR</span><span className="mono font-bold">{patient.egfr}</span><span className={`ml-1 inline-flex ${patient.egfrTrend === 'down' ? 'text-destructive' : patient.egfrTrend === 'up' ? 'text-primary' : 'text-muted-foreground'}`}>{patient.egfrTrend === 'down' ? <ArrowDownRight className="h-3 w-3" /> : patient.egfrTrend === 'up' ? <ArrowUpRight className="h-3 w-3" /> : <Activity className="h-3 w-3" />}</span></div><div><StatusBadge value={patient.status} /></div><div className="hidden min-w-0 text-xs md:block"><div className="truncate font-semibold">{patient.doctor}</div><div className="mt-0.5 text-muted-foreground">Updated {dateLabel(patient.updatedAt)}</div></div><div className="flex items-center gap-1 md:justify-end"><Link href={`/patients/${patient.id}`} aria-label={`View ${patient.fullName}`} data-testid={`button-view-patient-${patient.id}`} className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-primary"><Eye className="h-4 w-4" /></Link><button disabled={deleting} onClick={() => onDelete(patient.id, patient.fullName)} aria-label={`Remove ${patient.fullName}`} data-testid={`button-delete-patient-${patient.id}`} className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-4 w-4" /></button></div></div>)}</div></div>;
}