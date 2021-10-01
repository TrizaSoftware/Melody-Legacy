// Copyright (c) 2020-2021 T:Riza Corporation. All rights reserved.
// The full license is available in the LICENSE file at the root of this project.

declare type Require<T, K extends keyof T> = T & { [P in K]-?: T[P] };
