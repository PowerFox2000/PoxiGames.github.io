cmake_minimum_required(VERSION 3.16)
project(JsonPoxi)

set(CMAKE_CXX_STANDARD 17)

# Add your executable
add_executable(JsonPoxi
    JsonFiller_PG3.cpp
)

# Add JsonCpp sources
add_library(jsoncpp
    include/jsoncpp/src/lib_json/json_reader.cpp
    include/jsoncpp/src/lib_json/json_value.cpp
    include/jsoncpp/src/lib_json/json_writer.cpp
)

target_include_directories(jsoncpp PUBLIC
    include/jsoncpp/include
)

# Add OpenXLSX
add_subdirectory(include/OpenXLSX)

# Link everything
target_link_libraries(JsonPoxi PRIVATE
    jsoncpp
    OpenXLSX
)
