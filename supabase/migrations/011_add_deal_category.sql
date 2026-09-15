-- Deal cards show a category chip (Beach & Islands, Nature & Wildlife, ...).
-- It used to be guessed on the client from the deal's own words; it is a real,
-- admin-chosen column now. Values must stay in sync with
-- web/src/lib/deal-category.ts and worker/src/lib/validators.ts.
alter table tour_deals add column if not exists category text;

alter table tour_deals drop constraint if exists tour_deals_category_check;

alter table tour_deals
  add constraint tour_deals_category_check
  check (category is null or category in ('beach', 'nature', 'hill', 'river', 'heritage', 'adventure', 'tour'));

-- Backfill existing rows with the exact keyword rules the client used to apply,
-- in the same priority order, so no card changes appearance on deploy.
with matched as (
  select
    id,
    lower(
      coalesce(title, '') || ' ' ||
      coalesce(destination, '') || ' ' ||
      coalesce(short_description, '')
    ) as haystack
  from tour_deals
  where category is null
)
update tour_deals d
set category = case
  when m.haystack ~ '(beach|sea|island|coast|coral|cox|kuakata|martin|bay|snorkel|dive)' then 'beach'
  when m.haystack ~ '(sundarban|mangrove|forest|wildlife|tiger|safari|jungle|national park|bird|haor|wetland)' then 'nature'
  when m.haystack ~ '(hill|tea|bandarban|rangamati|sylhet|srimangal|mountain|valley|tribal|cloud)' then 'hill'
  when m.haystack ~ '(river|cruise|boat|launch|padma|lake|canal|houseboat)' then 'river'
  when m.haystack ~ '(heritage|culture|museum|fort|palace|mosque|temple|historic|history|old town|bazaar|city tour|dhaka)' then 'heritage'
  when m.haystack ~ '(trek|trekking|hike|hiking|camp|camping|rafting|adventure|kayak|zipline|rappelling)' then 'adventure'
  else 'tour'
end
from matched m
where d.id = m.id;

-- Cards filter/sort by category, so keep lookups cheap.
create index if not exists idx_tour_deals_category on tour_deals(category);
