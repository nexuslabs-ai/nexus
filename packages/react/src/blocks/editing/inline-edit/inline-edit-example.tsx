import { useState } from 'react';

import { InlineEdit } from './inline-edit';

export function InlineEditExample() {
  const [name, setName] = useState('Priya Shah');
  return <InlineEdit label="Name" value={name} onCommit={setName} />;
}
