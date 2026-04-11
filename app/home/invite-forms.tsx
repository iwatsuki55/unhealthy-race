"use client";

import * as React from "react";
import { useFormStatus } from "react-dom";
import {
  generateInviteCode,
  joinRaceByInviteCode,
  type InviteFormState,
} from "@/app/home/invite-actions";
import type { RaceInvite } from "@/lib/race-invite-server";

const initialState: InviteFormState = {
  error: null,
};

function SubmitButton({
  pendingLabel,
  idleLabel,
}: {
  pendingLabel: string;
  idleLabel: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-wait disabled:opacity-70"
      disabled={pending}
    >
      {pending ? pendingLabel : idleLabel}
    </button>
  );
}

export function GenerateInviteForm({ invites }: { invites: RaceInvite[] }) {
  const [state, formAction] = React.useActionState(generateInviteCode, initialState);

  return (
    <div className="space-y-5">
      <form action={formAction} className="space-y-4">
        <div>
          <label
            htmlFor="relationship_type"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            招待の種類
          </label>
          <select
            id="relationship_type"
            name="relationship_type"
            defaultValue="friend"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
          >
            <option value="friend">友達として招待</option>
            <option value="rival">ライバルとして招待</option>
          </select>
        </div>

        {state.error ? (
          <p className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {state.error}
          </p>
        ) : null}

        <SubmitButton pendingLabel="発行中..." idleLabel="招待コードを発行" />
      </form>

      <div className="space-y-3">
        <p className="text-sm font-medium text-slate-700">発行済みコード</p>
        {invites.length === 0 ? (
          <p className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
            まだ招待コードはありません。
          </p>
        ) : (
          <div className="space-y-2">
            {invites.map((invite) => (
              <div
                key={invite.id}
                className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900">{invite.code}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {invite.relationship_type === "rival" ? "ライバル招待" : "友達招待"}
                  </p>
                </div>
                <p className="text-xs text-slate-400">
                  {new Date(invite.created_at).toLocaleString("ja-JP")}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function JoinInviteForm() {
  const [state, formAction] = React.useActionState(joinRaceByInviteCode, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label
          htmlFor="invite_code"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          招待コード
        </label>
        <input
          id="invite_code"
          name="invite_code"
          type="text"
          maxLength={8}
          placeholder="例: A1B2C3D4"
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm uppercase outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
          required
        />
      </div>

      {state.error ? (
        <p className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {state.error}
        </p>
      ) : null}

      <p className="text-sm leading-6 text-slate-600">
        参加すると、このレースが現在のレースとして表示されます。
      </p>

      <SubmitButton pendingLabel="参加中..." idleLabel="招待コードで参加" />
    </form>
  );
}

