"use strict";

//////// C functions and values needed
const POINTER_SIZE_BYTES;
function JS_GetArrayBufferData(buffer) {
  throw new Error("Not impleented");
}


///////// Values

/**
 * Root object for C values.
 *
 * @param {CType} type The type of this value
 * @constructor
 */
function CData(type) {
  if (!type || (!type instanceof CType)) {
    throw new TypeError("Missing type");
  }
  Object.defineProperty(this, "type", {value:
    type
  });
};
CData.prototype = {
  address: function address() {
    return new (this.type.ptr)(JS_GetArrayBufferData(this.buffer));
  },
  get buffer() {
    // Implement this in every subclass
    throw new Error("Cannot get the buffer of a pure CData");
  },
  toString: function toString() {
    return "CData(" + this.type + ")";
  },
  toSource: function toSource() {
    return "new CData(" + this.type.toSource() + ")";
  }
};
/**
 * All instances of CData have the following values:
 *
 * @type {ArrayBuffer} buffer The ArrayBuffer holding the value.
 * @type {CType} type The type of the value.
 * @type {function() CData} address Method returning a pointer to the C value
 * @type {function} toSource
 * @type {function} toString
 */

/**
 * Implementation of type int8_t.
 *
 * Internal representation is an ArrayBuffer of 1 byte.
 *
 * @param {Number=} value The initial value of this number. 0 if undefined.
 * @constructor
 */
CData.int8_t = new CType("int8_t", function int8_t(value) {
  CData.call(this, CData.int8_t);
  let buffer = new ArrayBuffer(1);
  let view = new Int8Array(buffer);
  Object.defineProperty(this, "buffer", {
    value: buffer
  });
  Object.defineProperty(this, "view", {
    value: view
  });
  if (value != undefined) {
    this.value = value;
  }
});

CData.int8_t.prototype = Object.create(CData.prototype);
CData.int8_t.prototype.toString = function() {
  return ""+this.view[0];
};
Object.defineProperty(CData.int8_t.prototype, "value",
  {
    get: function value() {
      return this.view[0];
    },
    set: function value(x) {
      this.view[0] = x;
    }
  }
);

// Class methods/properties

Object.defineProperty(CData.int8_t, "toSource", {
    value: function toSource() {
      return "CData.int8_t";
    }
});


//////// Utility functions

/**
 * Generic constructor for a pointer. Used by the |ptr| getter.
 */
function ptr_t(type, address) {
  CData.call(this, type);
  let buffer = new ArrayBuffer(POINTER_SIZE_BYTES);
  let view = new Int64Array(buffer);
  Object.defineProperty(this, "buffer", {
    value: buffer
  });
  Object.defineProperty(this, "view", {
    value: view
  });
  if (value != undefined) {
    this.value = value;
  }
}

//////// Types

/**
 * Manifestation of a C type.
 *
 * @param {string} name The name of the type. Used for pretty-printing.
 * @param {function} implem A factory for values of this type, returning
 * C values.
 * @constructor
 */
function CType(name, implem) {
  let result = function() {
    return implem.apply(this, arguments);
  };
  result.__proto__ = CType.prototype;
  Object.defineProperty(result, "name", {
    value: name
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
      let ptr_constructor = function ptr_constructor(address) {
        ptr_t(type, address);
      };
      let type = new CType(this.name+"*", ptr_t);
      type.prototype = Object.create(CData.prototype);
      Object.defineProperties(type.prototype, {
        toString: {value: function toString() {
          // Implementation of |toString| for instances of this type of pointers
          // ...
        }},
        toSource: {value: function toString() {
          // Implementation of |toSource| for instances of this type of pointers
          // ...
        }},
        value: {set: function value(address) {
          // Copy the address to |this.buffer| (created by function |ptr_t|)
          // ...
        }},
        size: {value: POINTER_SIZE_BYTES
        }
      });
      return this.ptr = type;
    }
  }
);

// Container: