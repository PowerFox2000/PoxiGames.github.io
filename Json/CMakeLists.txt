cmake_minimum_required(VERSION 3.16)
project(JsonPoxi)

set(CMAKE_CXX_STANDARD 17)

add_executable(JsonPoxi
        JsonFiller_PG3.cpp
)

# OpenXLSX
find_package(OpenXLSX REQUIRED)

# JsonCpp
find_package(PkgConfig REQUIRED)
pkg_check_modules(JSONCPP jsoncpp)

target_include_directories(JsonPoxi PRIVATE
        ${JSONCPP_INCLUDE_DIRS}
)

target_link_libraries(JsonPoxi PRIVATE
        OpenXLSX::OpenXLSX
        ${JSONCPP_LIBRARIES}
)