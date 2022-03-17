package api.app.astrodao.com.core.dto.api.search;

import lombok.Data;

public @Data class Permissions{
	private boolean canApprove;
	private boolean canDelete;
	private boolean canReject;
	private boolean isCouncil;
}