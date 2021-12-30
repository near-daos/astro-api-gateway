package api.app.astrodao.com.core.dto.api.search;

import api.app.astrodao.com.openapi.models.DaoResponse;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.Data;


@Data
public class SearchResultDto {
    private DaoResponse daos;
    //TODO: Create proper model
    private JsonNode proposals;
}
