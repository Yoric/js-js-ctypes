// Libraries

// Actually, I think that we should mostly keep the current implementation of
// |Library| (exept it calls JS for the function type).

function Library() {
  
}

Object.defineProperty(Library.prototype, "declare", {
  value: function declare(symbol, abi, returnType /*argtypes*/) {
    // FIXME: Add type guards
    // FIXME: Ensure library is open

    let funPtr = C_FindFunctionSymbol(this.library, abi.buildSymbolName(symbol)); // FIXME: Implement abi.buildSymbolName
    if (!funPtr) return undefined;

    // Build function type
    let signature = Array.prototype.splice.call(arguments, 2);
    let funType = ctypes.FunctionType.apply(signature);

    let funObject = new funType(funPtr);
    return function c_function_wrapper() {
      return funObject.code.apply(funObject, arguments);
    };
    // FIXME: Move everything below to  |CType.FunctionType|


    return c_function_wrapper;
  }
});