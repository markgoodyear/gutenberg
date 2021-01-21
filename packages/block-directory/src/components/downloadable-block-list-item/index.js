/**
 * WordPress dependencies
 */
import { __, sprintf } from '@wordpress/i18n';
import {
	Button,
	Spinner,
	VisuallyHidden,
	__unstableCompositeItem as CompositeItem,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { decodeEntities } from '@wordpress/html-entities';
import { getBlockType } from '@wordpress/blocks';
import { useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import BlockRatings from '../block-ratings';
import DownloadableBlockIcon from '../downloadable-block-icon';
import { store as blockDirectoryStore } from '../../store';

function DownloadableBlockListItem( { composite, item, onClick } ) {
	const { author, description, icon, rating, ratingCount, title } = item;
	// getBlockType returns a block object if this block exists, or null if not.
	const isInstalled = !! getBlockType( item.name );

	const { isInstalling, isInstallable } = useSelect(
		( select ) => {
			const {
				getErrorNoticeForBlock,
				isInstalling: isBlockInstalling,
			} = select( blockDirectoryStore );
			const notice = getErrorNoticeForBlock( item.id );
			const hasFatal = notice && notice.isFatal;
			return {
				isInstalling: isBlockInstalling( item.id ),
				isInstallable: ! hasFatal,
			};
		},
		[ item ]
	);

	let statusText = '';
	if ( isInstalled ) {
		statusText = __( 'Installed!' );
	} else if ( isInstalling ) {
		statusText = __( 'Installing…' );
	}

	return (
		<CompositeItem
			role="option"
			as={ Button }
			{ ...composite }
			className="block-directory-downloadable-block-list-item"
			onClick={ ( event ) => {
				event.preventDefault();
				onClick();
			} }
			isBusy={ isInstalling }
			disabled={ isInstalling || ! isInstallable }
		>
			<div className="block-directory-downloadable-block-list-item__icon">
				{ isInstalling && (
					<span className="block-directory-downloadable-block-list-item__spinner">
						<Spinner />
					</span>
				) }
				<DownloadableBlockIcon icon={ icon } title={ title } />
			</div>
			<span className="block-directory-downloadable-block-list-item__details">
				<span className="block-directory-downloadable-block-list-item__title">
					{ createInterpolateElement(
						sprintf(
							/* translators: %1$s: block title, %2$s: author name. */
							__( '%1$s <span>by %2$s</span>' ),
							decodeEntities( title ),
							author
						),
						{
							span: (
								<span className="block-directory-downloadable-block-list-item__author" />
							),
						}
					) }
				</span>
				<BlockRatings rating={ rating } ratingCount={ ratingCount } />
				<span className="block-directory-downloadable-block-list-item__desc">
					{ !! statusText
						? statusText
						: decodeEntities( description ) }
				</span>
				{ isInstallable && ! ( isInstalled || isInstalling ) && (
					<VisuallyHidden>{ __( 'Install block' ) }</VisuallyHidden>
				) }
			</span>
		</CompositeItem>
	);
}

export default DownloadableBlockListItem;
