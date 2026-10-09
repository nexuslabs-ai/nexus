'use client';

import * as React from 'react';

/**
 * True inside a ButtonGroup. Its members share borders, so a Button there skips
 * press compression to keep the seams joined.
 */
const ButtonGroupJoinedContext = React.createContext(false);

export { ButtonGroupJoinedContext };
