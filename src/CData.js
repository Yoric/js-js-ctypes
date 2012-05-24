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



//////// Implementing pointers

function CPointerData(targetType, address) {
  CData.call(targetType.ptr);
  let buffer = new ArrayBuffer(POINTER_SIZE_BYTES);
  let view = new UInt16Array(buffer);
  Object.defineProperty(this, "buffer", {
    value: buffer
  });
  Object.defineProperty(this, "view", {
    value: view
  });
  if (address) {
    this.value = address;
  }
}

Object.defineProperty(CPointerData.prototype, "value", {
  get: function value() {
    // ?
  },
  set: function value(address) {
    // Copy the address to |this.buffer| (created by function |ptr_t|)
  }
});

Object.defineProperty(CPointerData.prototype, "isNull", {
  value: function isNull() {
    let view = this.view;
    for (let i = 0; i < POINTER_SIZE_BYTES; ++i) {
      if (view[i] != 0) {
        return false;
      }
      return true;
    }
  }
});

Object.defineProperty(CPointerData.prototype, "contents", {
  value: function contents(size) {
    if (this.type.size && size) {
      size = Number.min(this.type.size, size);
    } else if (!this.type.size && !size) {
      throw new Error("Cannot fetch the contents of pointer without size");
    } else {
      size = size || this.type.size;
    }
    return this.type.adopt(JS_GetPointerAsUnmanagedArrayBuffer(this.buffer, size));
  }
});