import * as React from 'react';

import { choiceRule } from '../../blocks/filtering/choice-filter/choice-filter-example';
import { dateRangeRule } from '../../blocks/filtering/date-range-filter/date-range-filter-example';
import { multiChoiceRule } from '../../blocks/filtering/multi-choice-filter/multi-choice-filter-example';
import { numberComparisonRule } from '../../blocks/filtering/number-comparison-filter/number-comparison-filter-example';
import { numberRangeRule } from '../../blocks/filtering/number-range-filter/number-range-filter-example';
import { textRule } from '../../blocks/filtering/text-filter/text-filter-example';
import { FilterBuilder } from '../../components/filter-builder';
import type { FilterGroup } from '../../lib/filter-model';

import { exampleFields } from './advanced-fixtures';
import {
  emptyMemberQuery,
  MemberDirectory,
  type MemberResults,
} from './member-directory';

export const convertedRules = [
  choiceRule('status-rule', 'status', { operator: 'is', value: 'active' }),
  multiChoiceRule('team-rule', 'team', {
    operator: 'isAnyOf',
    values: ['design', 'engineering'],
  }),
  textRule('name-rule', 'name', { operator: 'startsWith', value: 'Ma' }),
  numberComparisonRule('projects-rule', 'projects', {
    operator: 'greaterThan',
    value: 3,
  }),
  numberRangeRule('projects-range-rule', 'projects', {
    operator: 'between',
    min: 1,
    max: 10,
  }),
  dateRangeRule('joined-rule', 'joined', {
    operator: 'between',
    from: new Date(2026, 8, 1),
    to: new Date(2026, 8, 30),
  }),
].filter((rule) => rule !== null);
export function ConvertedRules() {
  const [tree, setTree] = React.useState<FilterGroup>({
    kind: 'group',
    id: 'root',
    conjunction: 'all',
    children: convertedRules,
  });
  return (
    <FilterBuilder
      aria-label="Converted block conditions"
      fields={exampleFields}
      value={tree}
      onValueChange={setTree}
    />
  );
}
export function ResultState({
  results,
  filtered,
  onRetry = () => {},
}: {
  results: MemberResults;
  filtered: boolean;
  onRetry?: () => void;
}) {
  return (
    <MemberDirectory
      query={
        filtered ? { ...emptyMemberQuery, status: 'Invited' } : emptyMemberQuery
      }
      onQueryChange={() => {}}
      results={results}
      onRetry={onRetry}
    />
  );
}
export const noMembers: MemberResults = {
  state: 'ready',
  data: { members: [], total: 0, page: 1, pageCount: 1 },
};
