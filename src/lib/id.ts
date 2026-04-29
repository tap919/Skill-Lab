/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export function generateId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
