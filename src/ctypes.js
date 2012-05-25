"use strict";

// Implementation notes
// - every piece of C data is represented as an ArrayBuffer;
// - a pointer itself is an ArrayBuffer of POINTER_SIZE_BYTES


//////// C functions and values needed

/**
 * The size of a pointer, in bytes.
 */
const POINTER_SIZE_BYTES;
/**
 * The (platform-dependent) minimal size of an argument, in bytes.
 */
const FFI_ARG_BYTES;

/**
 * Get a pointer to an ArrayBuffer
 *
 * @param {ArrayBuffer} data The data to which we want a pointer.
 * @param {ArrayBuffer} outBuffer A buffer for storing the pointer.
 * @param {Number*} outBufferPos A position in the buffer.
 */
function C_GetPointerToData(data, outBuffer, outBufferPos) {
  // Implemented with JS_GetArrayBufferData
  throw new Error("Not implemented");
}

/**
 * Map a chunk of memory to a fake ArrayBuffer.
 */
function C_GetPointerAsUnmanagedArrayBuffer(pointer, length, to) {
  throw new Error("Not implemented");
}

function C_LoadLibraryWithFlags() {
  // PR_LoadLibraryWithFlags
  
}
function C_FindFunctionSymbol(symbol) {
  // PR_FindFunctionSymbol
}

function C_PlaceFFICall() {
  // Uses JSAutoSuspendRequest
  // Uses errno
  // Uses GetLastError/SetLastError
  // Uses ffi_call(&fninfo->mCIF, FFI_FN(fn), returnValue.mData,
  //             reinterpret_cast<void**>(values.begin()));
}

// Container: