import { Head, Link, useForm } from "@inertiajs/react";
import { ArrowLeft, Camera, Save, Trash2 } from "lucide-react";
import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import AppLayout from "@/Layouts/AppLayout";
import { Button, Card, Field, Input, Select, Textarea } from "@/Components/UI";
import type { Member } from "@/types";

type Option = { id: string; name: string };
type Props = {
  member: (Member & { ministry_groups?: Option[] }) | null;
  households: Option[];
  ministryGroups: Option[];
};

const defaultChurchUnits: Option[] = [
  { id: "media-team", name: "Media Team" },
  { id: "social-media-team", name: "Social Media Team" },
  { id: "choir", name: "Choir" },
  { id: "prayer-team", name: "Prayer Team" },
  { id: "ushering-team", name: "Ushering Team" },
  { id: "welfare-team", name: "Welfare Team" },
  { id: "youth-team", name: "Youth Team" },
];

const allowedUnitNames = new Set(defaultChurchUnits.map((unit) => unit.name));

export default function Form({ member, households, ministryGroups }: Props) {
  const churchUnitOptions = households.length
    ? households.filter((household) => allowedUnitNames.has(household.name))
    : defaultChurchUnits;
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(
    member?.photo_url ?? member?.passport_photo ?? null,
  );
  const form = useForm<{
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    status: string;
    gender: string;
    date_of_birth: string;
    join_date: string;
    address: string;
    city: string;
    state: string;
    postal_code: string;
    role: string;
    household_id: string;
    ministry_group_ids: string[];
    emergency_contact_name: string;
    emergency_contact_phone: string;
    notes: string;
    photo: File | null;
    remove_photo: boolean;
  }>({
    first_name: member?.first_name ?? "",
    last_name: member?.last_name ?? "",
    email: member?.email ?? "",
    phone: member?.phone ?? "",
    status: member?.status ?? "new",
    gender: member?.gender ?? "",
    date_of_birth: member?.date_of_birth?.slice(0, 10) ?? "",
    join_date:
      member?.join_date?.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
    address: member?.address ?? "",
    city: member?.city ?? "",
    state: member?.state ?? "",
    postal_code: member?.postal_code ?? "",
    role: member?.role ?? "member",
    household_id: member?.household?.id ?? "",
    ministry_group_ids: member?.ministry_groups?.map((g) => g.id) ?? [],
    emergency_contact_name: member?.emergency_contact_name ?? "",
    emergency_contact_phone: member?.emergency_contact_phone ?? "",
    notes: member?.notes ?? "",
    photo: null,
    remove_photo: false,
  });
  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;
    form.setData((prev) => ({ ...prev, photo: file, remove_photo: false }));
    setPhotoPreview(URL.createObjectURL(file));
  };
  const handleRemovePhoto = () => {
    form.setData((prev) => ({ ...prev, photo: null, remove_photo: true }));
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  const initials =
    `${form.data.first_name[0] ?? ""}${form.data.last_name[0] ?? ""}`.toUpperCase() ||
    member?.initials ||
    "MB";
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (member) {
      form.transform((data) => ({ ...data, _method: "put" }));
      form.post(`/members/${member.id}`, { forceFormData: true });
    } else {
      form.post("/members", { forceFormData: true });
    }
  };
  const selectedYouthChurch = form.data.ministry_group_ids[0] ?? "";
  return (
    <AppLayout title={member ? "Edit member" : "Add member"}>
      <Head title={member ? "Edit member" : "Add member"} />
      <Link
        href={member ? `/members/${member.id}` : "/members"}
        className="back"
      >
        <ArrowLeft /> Back
      </Link>
      <div className="page-heading">
        <div>
          <p className="eyebrow">MEMBER RECORD</p>
          <h2>{member ? "Edit member" : "Create a member profile"}</h2>
          <p>
            Capture accurate contact, church unit, and participation
            information.
          </p>
        </div>
      </div>
      <form onSubmit={submit} className="member-form">
        <Card>
          <div className="card-head">
            <h3>Identity and contact</h3>
          </div>
          <div className="passport-upload-row">
            <div className="avatar avatar-xl">
              {photoPreview ? (
                <img src={photoPreview} alt="Passport preview" />
              ) : (
                <span>{initials}</span>
              )}
            </div>
            <div className="passport-upload-actions">
              <strong>Passport photograph</strong>
              <small>Upload a clear passport-style photo (JPG, PNG, or WebP, max 2MB).</small>
              <div className="passport-upload-buttons">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  onChange={handlePhotoChange}
                  hidden
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera /> {photoPreview ? "Change passport photo" : "Upload passport photo"}
                </Button>
                {photoPreview && (
                  <Button
                    type="button"
                    variant="danger"
                    onClick={handleRemovePhoto}
                  >
                    <Trash2 /> Remove
                  </Button>
                )}
              </div>
              {form.errors.photo && (
                <small className="error">{form.errors.photo}</small>
              )}
            </div>
          </div>
          <div className="form-grid">
            <Field label="First name" error={form.errors.first_name}>
              <Input
                value={form.data.first_name}
                onChange={(e) => form.setData("first_name", e.target.value)}
                required
              />
            </Field>
            <Field label="Last name" error={form.errors.last_name}>
              <Input
                value={form.data.last_name}
                onChange={(e) => form.setData("last_name", e.target.value)}
                required
              />
            </Field>
            <Field label="Email" error={form.errors.email}>
              <Input
                type="email"
                value={form.data.email}
                onChange={(e) => form.setData("email", e.target.value)}
              />
            </Field>
            <Field label="Phone" error={form.errors.phone}>
              <Input
                value={form.data.phone}
                onChange={(e) => form.setData("phone", e.target.value)}
              />
            </Field>
            <Field label="Gender" error={form.errors.gender}>
              <Select
                value={form.data.gender}
                onChange={(e) => form.setData("gender", e.target.value)}
              >
                <option value="">Not recorded</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="non_binary">Non-binary</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </Select>
            </Field>
            <Field label="Date of birth" error={form.errors.date_of_birth}>
              <Input
                type="date"
                value={form.data.date_of_birth}
                onChange={(e) => form.setData("date_of_birth", e.target.value)}
              />
            </Field>
          </div>
        </Card>
        <Card>
          <div className="card-head">
            <h3>Membership</h3>
          </div>
          <div className="form-grid">
            <Field label="Status" error={form.errors.status}>
              <Select
                value={form.data.status}
                onChange={(e) => form.setData("status", e.target.value)}
              >
                <option value="new">New</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Select>
            </Field>
            <Field label="Role" error={form.errors.role}>
              <Select
                value={form.data.role}
                onChange={(e) => form.setData("role", e.target.value)}
              >
                <option value="member">Member</option>
                <option value="volunteer">Volunteer</option>
                <option value="leader">Leader</option>
              </Select>
            </Field>
            <Field label="Join date" error={form.errors.join_date}>
              <Input
                type="date"
                value={form.data.join_date}
                onChange={(e) => form.setData("join_date", e.target.value)}
              />
            </Field>
            <Field label="Units" error={form.errors.household_id}>
              <Select
                value={form.data.household_id}
                onChange={(e) => form.setData("household_id", e.target.value)}
              >
                <option value="">No unit</option>
                {churchUnitOptions.map((h) => (
                  <option value={h.id} key={h.id}>
                    {h.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field
              label="Branch"
              error={form.errors.ministry_group_ids as string}
            >
              <Select
                value={selectedYouthChurch}
                onChange={(e) =>
                  form.setData(
                    "ministry_group_ids",
                    e.target.value ? [e.target.value] : [],
                  )
                }
              >
                <option value="">No branch church</option>
                {ministryGroups.map((g) => (
                  <option value={g.id} key={g.id}>
                    {g.name}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
        </Card>
        <Card>
          <div className="card-head">
            <h3>Address and care context</h3>
          </div>
          <div className="form-grid">
            <Field label="Street address" error={form.errors.address}>
              <Input
                value={form.data.address}
                onChange={(e) => form.setData("address", e.target.value)}
              />
            </Field>
            <Field label="City" error={form.errors.city}>
              <Input
                value={form.data.city}
                onChange={(e) => form.setData("city", e.target.value)}
              />
            </Field>
            <Field label="State / region" error={form.errors.state}>
              <Input
                value={form.data.state}
                onChange={(e) => form.setData("state", e.target.value)}
              />
            </Field>
            <Field label="Postal code" error={form.errors.postal_code}>
              <Input
                value={form.data.postal_code}
                onChange={(e) => form.setData("postal_code", e.target.value)}
              />
            </Field>
            <Field
              label="Emergency contact"
              error={form.errors.emergency_contact_name}
            >
              <Input
                value={form.data.emergency_contact_name}
                onChange={(e) =>
                  form.setData("emergency_contact_name", e.target.value)
                }
              />
            </Field>
            <Field
              label="Emergency phone"
              error={form.errors.emergency_contact_phone}
            >
              <Input
                value={form.data.emergency_contact_phone}
                onChange={(e) =>
                  form.setData("emergency_contact_phone", e.target.value)
                }
              />
            </Field>
            <Field label="Administrative notes" error={form.errors.notes}>
              <Textarea
                rows={4}
                value={form.data.notes}
                onChange={(e) => form.setData("notes", e.target.value)}
              />
            </Field>
          </div>
        </Card>
        <div className="form-actions">
          <Link
            href={member ? `/members/${member.id}` : "/members"}
            className="btn btn-secondary"
          >
            Cancel
          </Link>
          <Button type="submit" disabled={form.processing}>
            <Save /> {form.processing ? "Saving…" : "Save member"}
          </Button>
        </div>
      </form>
    </AppLayout>
  );
}
