-- Store admin-curated stops and the one-time generated road route.
-- Public deal pages render these values and never call a routing provider.
alter table tour_deals
  add column route_waypoints jsonb,
  add column route_geometry jsonb;
