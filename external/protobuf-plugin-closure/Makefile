# protobuf-plugin-closure build

VERBOSE?=0

ifeq ($(VERBOSE),1)
	QUIET:=
else
	QUIET:=@
endif

SPREFIX?=/usr
INCLUDE=$(SPREFIX)/include/
LIB=$(SPREFIX)/lib/
PROTOC=protoc

all: js/javascript_package.pb.cc js/int64_encoding.pb.cc protoc-gen-js protoc-gen-ccjs

# Note that building the cc files also builds the h files .
# We needed a specific file name in order to avert unnecesary recompiles .

js/javascript_package.pb.cc:
ifeq ($(VERBOSE),0)
	@echo "    PROTOC $@" ;
endif
	$(QUIET) $(PROTOC) \
    -I js \
    -I $(INCLUDE) \
    --cpp_out=js \
    js/javascript_package.proto

js/int64_encoding.pb.cc:
ifeq ($(VERBOSE),0)
	@echo "    PROTOC js/int64_encoding.pb" ;
endif
	$(QUIET) $(PROTOC) \
    -I js \
    -I $(INCLUDE) \
    --cpp_out=js \
    js/int64_encoding.proto

protoc-gen-js: js/javascript_package.pb.cc js/int64_encoding.pb.cc
ifeq ($(VERBOSE),0)
	@echo "    PROTOC protoc-gen-js" ;
endif
	$(QUIET) g++ -I $(INCLUDE) \
    -I . \
    ./js/code_generator.cc \
    ./js/protoc_gen_js.cc \
    ./js/javascript_package.pb.cc \
    ./js/int64_encoding.pb.cc \
    -l:$(LIB)libprotobuf.a \
    -l:$(LIB)libprotoc.a \
    -o ./protoc-gen-js \
    -lpthread

protoc-gen-ccjs: js/javascript_package.pb.cc js/int64_encoding.pb.cc
ifeq ($(VERBOSE),0)
	@echo "    PROTOC protoc-gen-ccjs" ;
endif
	$(QUIET) g++ -I $(INCLUDE) \
    -I . \
    ./ccjs/code_generator.cc \
    ./ccjs/protoc_gen_ccjs.cc \
    ./js/int64_encoding.pb.cc \
    -l:$(LIB)libprotobuf.a \
    -l:$(LIB)libprotoc.a \
    -o ./protoc-gen-ccjs \
    -lpthread

clean:
ifeq ($(VERBOSE),0)
	@echo "    RM js/javascript_package.pb.*" ;
endif
	$(QUIET) rm js/javascript_package.pb.* 2> /dev/null || true ;
ifeq ($(VERBOSE),0)
	@echo "    RM js/int64_encoding.pb.*" ;
endif
	$(QUIET) rm js/int64_encoding.pb.* 2> /dev/null || true ;
ifeq ($(VERBOSE),0)
	@echo "    RM protoc-gen-js" ;
endif
	$(QUIET) if [ -e protoc-gen-js ] ; then rm protoc-gen-js ; fi ;
ifeq ($(VERBOSE),0)
	@echo "    RM protoc-gen-ccjs" ;
endif
	$(QUIET) if [ -e protoc-gen-ccjs ] ; then rm protoc-gen-ccjs ; fi ;

