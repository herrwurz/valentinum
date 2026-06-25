"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import {
  resourceTypeLabels,
  resourceTypes,
  type ResourceDto,
} from "@/features/resources/resource-types";
import {
  saveResourceAction,
  type ResourceActionState,
} from "@/server/actions/resource-actions";

function SubmitButton({ editing }: { editing: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button className="button button-primary" type="submit" disabled={pending}>
      {pending ? "Wird gespeichert …" : editing ? "Änderungen speichern" : "Ressource anlegen"}
    </button>
  );
}

export function ResourceForm({ resource }: { resource?: ResourceDto }) {
  const initialState: ResourceActionState = {};
  const [state, action] = useActionState(saveResourceAction, initialState);

  return (
    <form className="resource-form" action={action}>
      {resource ? <input type="hidden" name="id" value={resource.id} /> : null}
      <div className="form-grid">
        <label className="field-wide">
          Name
          <input name="name" defaultValue={resource?.name} maxLength={120} required />
        </label>
        <label>
          Ressourcenart
          <select name="type" defaultValue={resource?.type ?? "ROOM"}>
            {resourceTypes.map((type) => <option key={type} value={type}>{resourceTypeLabels[type]}</option>)}
          </select>
        </label>
        <label>
          Standort
          <input name="location" defaultValue={resource?.location} maxLength={240} />
        </label>
        <label>
          Kapazität (Personen)
          <input name="capacity" type="number" min="0" step="1" defaultValue={resource?.capacity} />
        </label>
        <label>
          Fläche (m²)
          <input name="areaSqm" type="number" min="0" step="0.01" defaultValue={resource?.areaSqm} />
        </label>
        <label>
          Puffer davor (Minuten)
          <input name="bufferBeforeMinutes" type="number" min="0" step="1" defaultValue={resource?.bufferBeforeMinutes ?? 0} required />
        </label>
        <label>
          Puffer danach (Minuten)
          <input name="bufferAfterMinutes" type="number" min="0" step="1" defaultValue={resource?.bufferAfterMinutes ?? 0} required />
        </label>
        <label className="field-wide">
          Beschreibung
          <textarea name="description" rows={5} maxLength={2000} defaultValue={resource?.description} />
        </label>
        <label className="checkbox-field field-wide">
          <input name="publicVisible" type="checkbox" defaultChecked={resource?.publicVisible ?? true} />
          Ressource darf später in öffentlichen Auswahllisten erscheinen
        </label>
      </div>
      {state.error ? <p className="form-error" role="alert">{state.error}</p> : null}
      <div className="form-actions"><SubmitButton editing={Boolean(resource)} /></div>
    </form>
  );
}
