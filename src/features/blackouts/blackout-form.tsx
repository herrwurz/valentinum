"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { createBlackoutAction, type BlackoutActionState } from "@/server/actions/blackout-actions";

function Submit() {
  const { pending } = useFormStatus();
  return <button className="button button-primary" disabled={pending}>{pending ? "Wird angelegt …" : "Sperrzeit anlegen"}</button>;
}

export function BlackoutForm({ resources }: { resources: Array<{ id: string; name: string }> }) {
  const [state, action] = useActionState(createBlackoutAction, {} as BlackoutActionState);
  return (
    <form className="resource-form" action={action}>
      <div className="form-grid">
        <label>Ressource<select name="resourceId" required>{resources.map((resource) => <option key={resource.id} value={resource.id}>{resource.name}</option>)}</select></label>
        <label>Titel<input name="title" required maxLength={160} /></label>
        <label>Beginn<input name="startAt" type="datetime-local" required /></label>
        <label>Ende<input name="endAt" type="datetime-local" required /></label>
        <label className="field-wide">Grund<textarea name="reason" rows={3} maxLength={1000} /></label>
      </div>
      {state.error ? <p className="form-error" role="alert">{state.error}</p> : null}
      {state.success ? <p className="form-success" role="status">{state.success}</p> : null}
      <div className="form-actions"><Submit /></div>
    </form>
  );
}
