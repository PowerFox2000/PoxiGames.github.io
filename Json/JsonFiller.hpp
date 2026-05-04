#include <string>
#include <vector>
#include <json/json.h>
#include <fstream>
#include <iostream>
#include <OpenXLSX/OpenXLSX.hpp>
#include <OpenXLSX/headers/XLStyles.hpp>

struct minigames {
    std::vector<int> race;
    std::vector<int> hunt;
    std::vector<int> battle;
    std::vector<int> heist;
    std::vector<int> lavarun;
    std::vector<int> pirates;
    std::vector<int> dont_fall;
    std::vector<int> spleef;
    std::vector<int> extraction;
    std::vector<int> overcook;
};

struct player {
    std::string name;
    std::string minecraft;
    std::string discord;
    std::string discord_id;
    std::vector<std::string> team;
    std::string tier;
    std::string pronoun;
    std::vector<std::string> roles;
    std::vector<int> placement;
    std::vector<int> points;
    minigames games;
};
