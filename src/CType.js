//////// Types

/**
 * Manifestation of a C type.
 *
 * @param {string} name The name of the type. Used for pretty-printing.
 * @param {function} implem A factory for values of this type, returning
 * C values.
 * @constructor
 */
function CType(name, size, implem) {
  let result = function() {
    return implem.apply(this, arguments);
  };
  result.__proto__ = CType.prototype;
  Object.defineProperty(result, "name", {
    value: name
  });
  Object.defineProperty(result, "size", {
    value: size
  });
  return result;
}
/**
 * Instances of CType have the following type:
 * @type {string} name (read-only)
 * @type {CType} ptr A CType for pointers pointing to this value.
 * @type {Number} size (only for concrete implementations of CType): the number
 *  of bytes in a value of this type.
 */

Object.defineProperty(CType.prototype, "toString", {
  value: function toString() {
    return this.name;
  }
});

/**
 * Define a lazy getter for pointers to values of this type.
 */
Object.defineProperty(CType.prototype, "ptr", {
    get: function ptr() {
      delete this.ptr;
      return this.ptr = new CPointerType(this);
    }
  }
);

function CPointerType(type) {
  CType.call(type.name + "*", POINTER_SIZE_BYTES,
     function make_ptr(address) {
       return new CPointerData(CPointerType, address);
     });
  Object.defineProperty(this, "targetType", {
    value: type
  });
}
CPointerType.prototype = Object.create(CType.prototype);
Object.defineProperty(CPointerType.prototype, "toSource", {
  value: function toSource() {
    return this.targetType.toSource() + ".ptr";
  }
});
