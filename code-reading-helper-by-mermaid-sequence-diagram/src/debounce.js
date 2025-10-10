"use strict";
/*
 * This code is based on Mermaid Chart
 * Copyright (c) 2023 Mermaid Chart
 * Licensed under MIT License
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.debounce = void 0;
/**
 * Debounces a function by a specified wait time.
 * @param func The function to debounce.
 * @param wait The wait time in milliseconds.
 * @returns A debounced version of the function.
 */
function debounce(func, wait) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}
exports.debounce = debounce;
//# sourceMappingURL=debounce.js.map