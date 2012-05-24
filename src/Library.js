// Libraries

function Library() {
  
}

Object.defineProperty(Library.prototype, "declare", {
  value: function declare(symbol, abi, returnType /*argtypes*/) {
    // FIXME: Ensure library is open
    // FIXME: Build symbol name
    // FIXME: Find function symbol
    // FIXME: Build closure to convert arguments to C
    // FIXME: Build closure to convert return from C
    // FIXME: Build closure to call libffi
    // FIXME: Return closure
  }
});