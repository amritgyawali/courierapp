import { useMemo } from 'react';

import { CURRENT_RIDER_ID, optimizeRoute, riderStats, riderTasks, type Shipment, taskKind } from '@/data/ops';
import { useOps } from '@/state/ops-state';

export type Stop = { shipment: Shipment; latitude: number; longitude: number; sequence: number };

/**
 * The signed-in rider, their hub, live stats and today's route (nearest-neighbour order from the
 * hub). Until rider auth exists, the Rider role maps to `CURRENT_RIDER_ID`.
 */
export function useRider(now = new Date()) {
  const { data, dispatch } = useOps();
  const me = data.riders.find((r) => r.id === CURRENT_RIDER_ID) ?? data.riders[0];
  const hub = data.hubs.find((h) => h.id === me.hubId) ?? data.hubs[0];
  const stats = riderStats(data, me.id, now);

  const route = useMemo(() => {
    const merchantHub = new Map(data.merchants.map((m) => [m.id, data.hubs.find((h) => h.id === m.hubId) ?? hub]));
    const stops = riderTasks(data, me.id).map((s) => {
      const kind = taskKind(s);
      // Pickups and returns happen at the merchant; hub drops at the rider's hub.
      const at = kind === 'drop' ? hub : kind === 'pickup' || kind === 'return' ? merchantHub.get(s.merchantId)! : null;
      return {
        shipment: s,
        latitude: at ? at.latitude + (s.id.charCodeAt(s.id.length - 1) % 7) * 0.002 : s.latitude,
        longitude: at ? at.longitude + (s.id.charCodeAt(s.id.length - 2) % 7) * 0.002 : s.longitude,
      };
    });
    const { route: ordered, distanceKm } = optimizeRoute({ latitude: me.latitude, longitude: me.longitude }, stops);
    return { stops: ordered.map((s, i) => ({ ...s, sequence: i + 1 })) as Stop[], distanceKm };
  }, [data, me.id, me.latitude, me.longitude, hub]);

  return { data, dispatch, me, hub, stats, route, actor: me.name };
}
