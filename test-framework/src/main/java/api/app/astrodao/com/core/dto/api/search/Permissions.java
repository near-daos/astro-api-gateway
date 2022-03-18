package api.app.astrodao.com.core.dto.api.search;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class Permissions {
	@JsonProperty("canApprove")
	private boolean canApprove;

	@JsonProperty("canDelete")
	private boolean canDelete;

	@JsonProperty("canReject")
	private boolean canReject;

	@JsonProperty("isCouncil")
	private boolean isCouncil;
}