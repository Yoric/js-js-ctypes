//////// Types

/**
 * Representation of a C type.
 *
 * Used mainly to:
 * - convert a JavaScript value to a C value and back;
 * - determine the amount of memory occupied by a type;
 * - hold the name of a type.
 *
 * Each instance of |CType| behaves itself as a constructor for
 * a |CData| value.
 *
 * @param {string} name The name of the type. Used for pretty-printing.
 * @param {function} implem A factory for values of this type, returning
 * C values.
 * @constructor
 */
function CType(args) {
  let result = function() {
    return args.implem.apply(this, arguments);
  };
  result.__proto__ = CType.prototype;
  Object.defineProperty(result, "name", {
    value: args.name
  });
  Object.defineProperty(result, "size", {
    value: args.size
  });
  Object.defineProperty(result, "source", {
    value: args.source
  });
  return result;
}
/**
 * Instances of CType have the following type:
 * @type {string} name The C name of the type (read-only).
 * @type {CType} ptr A CType for pointers pointing to this value.
 * @type {Number} size (only for concrete implementations of CType): the number
 *  of bytes in a value of this type.
 */

Object.defineProperty(CType.prototype, "toString", {
  value: function toString() {
    return this.name;
  }
});
Object.definePropert(CType.prototype, "toSource", {
  value: function toString() {
    return this.source;
  }
});

/**
 * Get the type of pointers to values of |this| type.
 * See also instance method |address| of |CData| to
 * get a pointer to a value.
 *
 * @return {CPointerType}
 */
Object.defineProperty(CType.prototype, "ptr", {
    get: function ptr() {
      delete this.ptr;
      return this.ptr = new CPointerType(this);
    }
  }
);

/**
 * The constructor for pointer types.
 * End-users should use method |ptr| of instances of
 * |CType|, which is both more convenient, faster
 * and more memory-efficient.
 *
 * @param {CType} type a CType
 * @constructor
 * @extends {CType}
 */
CType.CPointerType = function CPointerType(type) {
  CType.call(
    {
      name: type.name + "*",
      source: type.source + ".ptr",
      size: POINTER_SIZE_BYTES,
      implem: function make_ptr(address) {
       return new CPointerData(type, address);
      }
    }
  );
  Object.defineProperty(this, "targetType", {
    value: type
  });
};
CType.CPointerType.prototype = Object.create(CType.prototype);

/**
 * The constructor for function types
 */
CType.CFunctionType = function CFunctionType(returnType, /*argType1, ...*/) {
  const argumentTypes = Array.prototype.slice.call(arguments, 1);

  // Build type name
  const nameA = argumentTypes.map(function(v) {
    return v.name;
  });
  let name = abi.callingConvention + " " + returnType.name + "(" + nameA.join() + ")";

  // Build type source
  let sourceA = Array.prototype.map.call(arguments, function(v) {
    return v.toSource();
  });
  let source = "new CType.CFunctionType(" + sourceA.join() + ")";

  let details = {
    name: name,
    source: source,
    size: undefined,
    implem: function make_fun(address) {
      return CFunctionData(returnType, argumentType, address);
    }
  };
  CType.call(details);
};