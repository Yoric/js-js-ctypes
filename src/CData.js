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
 * A value of type int8_t.
 *
 * Internal representation is an ArrayBuffer of 1 byte.
 *
 * @param {Number=} value The initial value of this number. 0 if undefined.
 * @constructor
 * @extends {CData}
 */
CData.int8_t = new CType("int8_t", "ctypes.int8_t",
  1, function int8_t(value) {
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
Object.defineProperty(CData.int8_t.prototype, "toString",
  {value: function toString() {
     return ""+this.view[0];
   }
});
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

//////// Implementing pointers

/**
 * A pointer
 *
 * @param {CType} targetType The type targeted.
 * @param {ArrayBuffer=} address Optionally, the address targeted.
 * @constructor
 * @extends {CData}
 */
CData.CPointerData = function CPointerData(targetType, address) {
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
};
CData.CPointerData.prototype = Object.create(CData);

Object.defineProperty(CPointerData.prototype, "value", {
  get: function value() {
    throw new Error("Cannot convert to primitive value");
  },
  set: function value(address) {
    // FIXME: Copy the address to |this.buffer|
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
    return this.type.adopt(C_GetPointerAsUnmanagedArrayBuffer(this.buffer, size));
  }
});


//////// Implementing functions

/**
 * A function
 *
 * @param {CType} returnType The return type of the function.
 * @param {Array.<CType>} argumentTypes The type of arguments to the function.
 * @param {ArrayBuffer=} address Optionally, the address of the function.
 * @constructor
 * @extends {CData}
 */

CData.CFunctionData = function CFunctionData(returnType, argumentTypes, address) {
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
  // Make sure that |this| can be used as a function
  let self = this;
  return function c_call(/*arguments*/) {
    return self.code(arguments);
  };
};
CData.CFunctionData.prototype = Object.create(CData);
Object.defineProperty(CData.CFunctionData.prototype, "code", {
  /**
   * Perform the call to C.
   *
   * @param {*=} args Arguments to pass to C. If they are not already instances
   * of CData, they will be converted automatically.
   * @return {*} The result of the C call. If possible, it is converted to a
   * natural JS value (number, string, etc.). Otherwise, it is returned as an
   * instance of |CData|.
   */
  value: function code(args) {
    let kung_fu_death_grip = []; // Stuff that should not be gc-ed
                               // before the end of the call.

    // 1. Convert arguments
    if (args.length != argumentTypes.length) {
        throw new TypeError("Function " + symbol + " expected " +
            argumentTypes.length + ",  got " + arguments.length );
    }

    let argv = new ArrayBuffer(POINTER_BYTE_SIZE * numberOfArguments);
    args.forEach(function(arg, i) {
      let current_argv = argumentTypes[i].toC(arg);
      kung_fu_death_grip.push(current_argv);
      C_GetPointerToData(current_argv, argv, POINTER_BYTE_SIZE * i);
    });

    // 2. Prepare return buffer
    let return_buffer = new ArrayBuffer(Number.max(FFI_ARG_BYTES, returnType.size));

    // 3. Place actual call
    C_PlaceFFICall(/*function pointer*/this.raw, return_buffer, argv);

    // 4. Decode result, release death grip
    kung_fu_death_grip = null;
    return returnType.fromC(return_buffer);
  }
});
