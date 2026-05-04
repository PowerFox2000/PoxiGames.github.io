#include "JsonFiller.hpp"

int getIntOrZero(const OpenXLSX::XLCell& cell) {
    if (cell.value().type() == OpenXLSX::XLValueType::Empty)
        return 0;
    return cell.value().get<int>();
}

int main() 
{
    int seasonNumber = 5;
    const std::string jsonFile = "JsonBackups/PG2S5.json";
    std::vector<player> players;

    OpenXLSX::XLDocument doc;
    doc.open("Excel data/PoxiGames2Season5.xlsx");


    bool hasRace = true;
    bool hasHunt = true;
    bool hasBattle = true;
    bool hasHeist = true;
    bool hasLavarun = true;
    bool hasPirates = true;
    bool hasDontFall = true;
    bool hasSpleef = true;
    bool hasExtraction = false;
    bool hasOvercook = false;

    std::ifstream data_file(jsonFile, std::ifstream::binary);
    if (!data_file.is_open()) { std::cerr << "Failed to open data.json\n"; return 1; }

    Json::Value data;
    
    Json::CharReaderBuilder builder;
    std::string errs;
    if (!Json::parseFromStream(builder, data_file, &data, &errs)) {std::cerr << "Failed to parse JSON: \n" << errs << std::endl; return 1; }
    
    for(const auto& p : data["players"])
    {
        player ppl;
        ppl.name        = p["name"].asString();
        ppl.minecraft   = p["minecraft"].asString();
        ppl.discord     = p["discord"].asString();
        ppl.discord_id  = p["discord_id"].asString();
        ppl.tier        = p["tier"].asString();
        ppl.pronoun     = p["pronoun"].asString();
        for(const auto& value : p["team"]) ppl.team.push_back(value.asString());
        for(const auto& value : p["roles"]) ppl.roles.push_back(value.asString());
        for(const auto& value : p["placement"]) ppl.placement.push_back(value.asInt());
        for(const auto& value : p["points"]) ppl.points.push_back(value.asInt());

        for(const auto& value : p["minigames"]["race"]) ppl.games.race.push_back(value.asInt());
        for(const auto& value : p["minigames"]["hunt"]) ppl.games.hunt.push_back(value.asInt());
        for(const auto& value : p["minigames"]["battle"]) ppl.games.battle.push_back(value.asInt());
        for(const auto& value : p["minigames"]["heist"]) ppl.games.heist.push_back(value.asInt());
        for(const auto& value : p["minigames"]["lavarun"]) ppl.games.lavarun.push_back(value.asInt());
        for(const auto& value : p["minigames"]["pirates"]) ppl.games.pirates.push_back(value.asInt());
        for(const auto& value : p["minigames"]["dont_fall"]) ppl.games.dont_fall.push_back(value.asInt());
        for(const auto& value : p["minigames"]["spleef"]) ppl.games.spleef.push_back(value.asInt());
        for(const auto& value : p["minigames"]["extraction"]) ppl.games.extraction.push_back(value.asInt());
        for(const auto& value : p["minigames"]["overcook"]) ppl.games.overcook.push_back(value.asInt());

        players.push_back(ppl);
    }
    
    auto sheet = doc.workbook().worksheet("Sheet1");

    uint64_t lastRow = sheet.rowCount();

    std::cout << "Players loaded: " << players.size() << std::endl;

    std::vector<bool> updated(players.size(), false);

    for (uint64_t row = 4; row <= lastRow; row++) {
        auto cell = sheet.cell(row, 1);
        if(cell.value().type() == OpenXLSX::XLValueType::Empty) continue;

        std::string minecraft = cell.value().get<std::string>();

        auto it = std::find_if(players.begin(), players.end(), [&](const player& p) {return p.minecraft == minecraft; });

        if(it == players.end()) {
            player newppl;

            for(int i = 0; i < seasonNumber - 1; i++) {
                newppl.minecraft = minecraft;
                newppl.points.push_back(0);
                newppl.team.push_back("");
                newppl.games.race.push_back(0);
                newppl.games.hunt.push_back(0);
                newppl.games.battle.push_back(0);
                newppl.games.heist.push_back(0);
                newppl.games.extraction.push_back(0);
                newppl.games.overcook.push_back(0);
                newppl.games.lavarun.push_back(0);
                newppl.games.pirates.push_back(0);
                newppl.games.dont_fall.push_back(0);
                newppl.games.spleef.push_back(0);
                newppl.placement.push_back(0);
            }

            newppl.minecraft = minecraft;
            newppl.points.push_back(getIntOrZero(sheet.cell(row, 2)));
            newppl.games.race.push_back(hasRace ? getIntOrZero(sheet.cell(row, 3)) : 0);
            newppl.games.hunt.push_back(hasHunt ? getIntOrZero(sheet.cell(row, 4)) : 0);
            newppl.games.battle.push_back(hasBattle ? getIntOrZero(sheet.cell(row, 5)) : 0);
            newppl.games.heist.push_back(hasHeist ? getIntOrZero(sheet.cell(row, 6)) : 0);
            newppl.games.lavarun.push_back(hasLavarun ? getIntOrZero(sheet.cell(row, 7)) : 0);
            newppl.games.extraction.push_back(hasExtraction ? getIntOrZero(sheet.cell(row, 7)) : 0);
            newppl.games.overcook.push_back(hasOvercook ? getIntOrZero(sheet.cell(row, 13)) : 0);
            newppl.games.pirates.push_back(hasPirates ? getIntOrZero(sheet.cell(row, 8)) : 0);
            newppl.games.dont_fall.push_back(hasDontFall ? getIntOrZero(sheet.cell(row, 9)) : 0);
            newppl.games.spleef.push_back(hasSpleef ? getIntOrZero(sheet.cell(row, 10)) : 0);

            newppl.placement.push_back(getIntOrZero(sheet.cell(row, 11)));
            newppl.team.push_back(
                sheet.cell(row, 12).value().type() == OpenXLSX::XLValueType::Empty
                    ? ""
                    : sheet.cell(row, 12).value().get<std::string>()
            );

            players.push_back(newppl);

            std::cout << "Added player : " << newppl.minecraft << std::endl;
        }

        else {
            size_t index = std::distance(players.begin(), it);
            updated[index] = true;

            player& ppl = *it;
            ppl.points.push_back(getIntOrZero(sheet.cell(row, 2)));
            ppl.games.race.push_back(hasRace ? getIntOrZero(sheet.cell(row, 3)) : 0);
            ppl.games.hunt.push_back(hasHunt ? getIntOrZero(sheet.cell(row, 4)) : 0);
            ppl.games.battle.push_back(hasBattle ? getIntOrZero(sheet.cell(row, 5)) : 0);
            ppl.games.heist.push_back(hasHeist ? getIntOrZero(sheet.cell(row, 6)) : 0);
            ppl.games.lavarun.push_back(hasLavarun ? getIntOrZero(sheet.cell(row, 7)) : 0);
            ppl.games.extraction.push_back(hasExtraction ? getIntOrZero(sheet.cell(row, 7)) : 0);
            ppl.games.overcook.push_back(hasOvercook ? getIntOrZero(sheet.cell(row, 13)) : 0);
            ppl.games.pirates.push_back(hasPirates ? getIntOrZero(sheet.cell(row, 8)) : 0);
            ppl.games.dont_fall.push_back(hasDontFall ? getIntOrZero(sheet.cell(row, 9)) : 0);
            ppl.games.spleef.push_back(hasSpleef ? getIntOrZero(sheet.cell(row, 10)) : 0);

            ppl.placement.push_back(getIntOrZero(sheet.cell(row, 11)));
            ppl.team.push_back(
                sheet.cell(row, 12).value().type() == OpenXLSX::XLValueType::Empty
                    ? ""
                    : sheet.cell(row, 12).value().get<std::string>()
            );

            std::cout << "Updated player : " << ppl.minecraft << std::endl;
        }
    }

    doc.close();

    for (size_t i = 0; i < updated.size(); i++) {
        if (!updated[i]) {
            players[i].points.push_back(0);
            players[i].games.race.push_back(0);
            players[i].games.hunt.push_back(0);
            players[i].games.battle.push_back(0);
            players[i].games.heist.push_back(0);
            players[i].games.extraction.push_back(0);
            players[i].games.overcook.push_back(0);
            players[i].games.lavarun.push_back(0);
            players[i].games.pirates.push_back(0);
            players[i].games.dont_fall.push_back(0);
            players[i].games.spleef.push_back(0);
            players[i].placement.push_back(0);
            players[i].team.push_back("");
        }
    }

    Json::Value newData;
    Json::Value playersArray(Json::arrayValue);

    for(const auto& p : players) {
        Json::Value playerJson;

        playerJson["name"] = p.name;
        playerJson["minecraft"] = p.minecraft;
        playerJson["discord"] = p.discord;
        playerJson["discord_id"] = p.discord_id;
        playerJson["tier"] = p.tier;
        playerJson["pronoun"] = p.pronoun;
        Json::Value team(Json::arrayValue);
        for(const auto& v : p.team) team.append(v);
        playerJson["team"] = team;
        Json::Value roles(Json::arrayValue);
        for(const auto& v : p.roles) roles.append(v);
        playerJson["roles"] = roles;
        Json::Value place(Json::arrayValue);
        for(const auto& v : p.placement) place.append(v);
        playerJson["placement"] = place;
        Json::Value points(Json::arrayValue);
        for(const auto& v : p.points) points.append(v);
        playerJson["points"] = points;
        
        Json::Value games;

        Json::Value battle(Json::arrayValue);
        for(const auto& v : p.games.battle) battle.append(v);
        games["battle"] = battle;
        Json::Value fall(Json::arrayValue);
        for(const auto& v : p.games.dont_fall) fall.append(v);
        games["dont_fall"] = fall;
        Json::Value extraction(Json::arrayValue);
        for(const auto& v : p.games.extraction) extraction.append(v);
        games["extraction"] = extraction;
        Json::Value lavarun(Json::arrayValue);
        for(const auto& v : p.games.lavarun) lavarun.append(v);
        games["lavarun"] = lavarun;
        Json::Value heist(Json::arrayValue);
        for(const auto& v : p.games.heist) heist.append(v);
        games["heist"] = heist;
        Json::Value hunt(Json::arrayValue);
        for(const auto& v : p.games.hunt) hunt.append(v);
        games["hunt"] = hunt;
        Json::Value spleef(Json::arrayValue);
        for(const auto& v : p.games.spleef) spleef.append(v);
        games["spleef"] = spleef;
        Json::Value pirates(Json::arrayValue);
        for(const auto& v : p.games.pirates) pirates.append(v);
        games["pirates"] = pirates;
        Json::Value race(Json::arrayValue);
        for(const auto& v : p.games.race) race.append(v);
        games["race"] = race;
        Json::Value overcook(Json::arrayValue);
        for(const auto& v : p.games.overcook) overcook.append(v);
        games["overcook"] = overcook;

        playerJson["minigames"] = games;

        playersArray.append(playerJson);
    }

    newData["players"] = playersArray;
    
    std::ofstream out(jsonFile);
    out << newData;
    out.close();

    return 0;
}