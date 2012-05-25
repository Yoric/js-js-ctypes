// Libraries

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


    let numberOfArguments = arguments.length - 3;


    let c_function_wrapper = function c_function_wrapper(/*arguments*/) {
      // FIXME: We could get rid of |signature|, for better JIT-ability

      // 1. Convert arguments
      if (arguments.length != numberOfArguments) {
        throw new TypeError("Function " + symbol + " expected " +
            numberOfArguments + ",  got " + arguments.length );
      }

      let ref_to_args = arguments;// Prevent |arguments| from being gc-ed during the call
      let ref_to_individual_argv = []; // Prevent converted args from being gc-ed during the call
      let argv = new ArrayBuffer(POINTER_BYTE_SIZE * numberOfArguments);
      for (let i = 0; i < arguments.length; ++i) {
        let current_arg = arguments[i];
        let current_argv = signature[i + 1].toC(current_arg);
        ref_to_individual_argv.push(current_argv);
        C_GetPointerToData(current_argv, argv, POINTER_BYTE_SIZE * i);
      }

      // 2. Prepare return buffer
      let return_buffer = new ArrayBuffer(Number.max(FFI_ARG_BYTES, signature[0].size));

      // 3. Place call to libffi
      C_PlaceFFICall(?, funPtr, return_buffer, argv);

      // 4. Decode and return result
      return returnType.adopt(return_buffer);
    };
    return c_function_wrapper;
  }
});